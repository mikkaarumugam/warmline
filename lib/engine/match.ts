import type { Graph, MatchResult, Path, Persona, PersonaId } from "@/lib/types";
import { findWarmPaths, warmthForDegree } from "@/lib/engine/paths";
import { pipeline, type FeatureExtractionPipeline } from "@huggingface/transformers";

// ─────────────────────────────────────────────────────────────────────────────
// Track A — SEMANTIC matching via LOCAL embeddings (transformers.js, no API key).
//
// We embed each persona's declared OFFER and the live ASK with a small sentence
// model (all-MiniLM-L6-v2), mean-pool + L2-normalize, then cosine similarity —
// which, for normalized vectors, is just a dot product. This understands meaning,
// not just word overlap: "billing systems" ≈ "billing and ledger systems" even
// when surface tokens differ.
//
// Persona-offer embeddings are cached in a module-level Map keyed by persona id
// (computed once, reused across requests). The pipeline is a lazily-loaded,
// cached singleton promise — the model downloads once on first use, then stays
// resident in memory.
//
// `matchAsk` signature and the MatchResult shape are the frozen contract.
// ─────────────────────────────────────────────────────────────────────────────

const MODEL_ID = "Xenova/all-MiniLM-L6-v2";

/** Lazily-created, cached singleton of the embedding pipeline. */
let embedderPromise: Promise<FeatureExtractionPipeline> | null = null;

function getEmbedder(): Promise<FeatureExtractionPipeline> {
  if (!embedderPromise) {
    embedderPromise = pipeline(
      "feature-extraction",
      MODEL_ID
    ) as Promise<FeatureExtractionPipeline>;
  }
  return embedderPromise;
}

/** Embed one string → an L2-normalized sentence vector (mean-pooled). */
async function embed(text: string): Promise<Float32Array> {
  const embedder = await getEmbedder();
  const output = await embedder(text, { pooling: "mean", normalize: true });
  // Tensor.data is the flat backing store; for a single input that's the vector.
  return output.data as Float32Array;
}

/**
 * Cached persona-offer embeddings, keyed by persona id. We also remember the
 * exact offer text that produced each vector, so a changed offer (e.g. a new
 * seed graph) is re-embedded rather than silently serving a stale vector.
 */
const offerCache = new Map<PersonaId, { offer: string; vec: Float32Array }>();

/** Get (or compute + cache) the normalized embedding for a persona's offer. */
async function embedOffer(persona: Persona): Promise<Float32Array> {
  const cached = offerCache.get(persona.id);
  if (cached && cached.offer === persona.offer) return cached.vec;

  const vec = await embed(persona.offer);
  offerCache.set(persona.id, { offer: persona.offer, vec });
  return vec;
}

/** Cosine similarity of two L2-normalized vectors == their dot product. */
function dot(a: Float32Array, b: Float32Array): number {
  let sum = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) sum += a[i] * b[i];
  return sum;
}

/**
 * Semantic similarity of an ask vs an offer, mapped into 0..1.
 *
 * Cosine for these sentence embeddings is theoretically [-1, 1] but in practice
 * stays positive (~0.0..0.7) for short role descriptions. We clamp to [0, 1] so
 * the `score` field honors the contract; we do NOT rescale, to keep scores
 * comparable across asks.
 */
function similarity(askVec: Float32Array, offerVec: Float32Array): number {
  return Math.max(0, Math.min(1, dot(askVec, offerVec)));
}

/**
 * Optional warmup: pre-load the model and pre-embed every persona's offer so the
 * first real /api/match request is fast. Safe to call repeatedly (idempotent via
 * the caches). Errors are swallowed — warmup is best-effort.
 */
export async function warmup(graph: Graph): Promise<void> {
  try {
    await getEmbedder();
    await Promise.all(graph.personas.map((p) => embedOffer(p)));
  } catch {
    // best-effort; the real request will surface any genuine failure
  }
}

/**
 * Match a live ask against the DECLARED OFFERS of everyone in the warm network
 * (1st + 2nd degree only), ranked by semantic score blended with path warmth.
 */
export async function matchAsk(
  graph: Graph,
  ask: string,
  meId: PersonaId = graph.me
): Promise<MatchResult[]> {
  const paths = findWarmPaths(graph, meId);
  const byId = new Map(graph.personas.map((p) => [p.id, p]));

  // Candidates = reachable personas (≤2 degrees), excluding "me".
  const candidates: { persona: Persona; path: Path }[] = [];
  for (const [targetId, path] of paths) {
    const persona = byId.get(targetId);
    if (!persona || targetId === meId) continue;
    candidates.push({ persona, path });
  }

  // Embed the ask once, and each candidate offer (cached) — in parallel.
  const [askVec, offerVecs] = await Promise.all([
    embed(ask),
    Promise.all(candidates.map((c) => embedOffer(c.persona))),
  ]);

  const results: MatchResult[] = [];
  for (let i = 0; i < candidates.length; i++) {
    const { persona, path } = candidates[i];
    const score = similarity(askVec, offerVecs[i]);

    const warmth = warmthForDegree(path.degree);
    // Rank blend: match quality dominates (0.75) so a strong 2nd-degree semantic
    // hit can outrank a weak 1st-degree one, while warmth (0.25) still nudges
    // closer connections up when scores are comparable.
    const rank = score * (0.75 + 0.25 * warmth);
    const mutual = path.degree === 2 ? byId.get(path.nodes[1]) : undefined;

    results.push({ persona, score, warmth, rank, path, mutual });
  }

  results.sort((a, b) => b.rank - a.rank);
  return results;
}
