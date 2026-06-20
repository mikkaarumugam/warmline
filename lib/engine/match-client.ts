import type { Graph, MatchResult, Path, Persona, PersonaId } from "@/lib/types";
import { findWarmPaths, warmthForDegree } from "@/lib/engine/paths";
import { ENDORSEMENTS } from "@/data/seed/vouches";
import embeddingsData from "@/data/seed/embeddings.json";

// ─────────────────────────────────────────────────────────────────────────────
// Track A — CLIENT-SIDE semantic matching (runs in the browser).
//
// Why this exists: the server engine (lib/engine/match.ts) loads
// @huggingface/transformers, which pulls in onnxruntime-node + a native
// libonnxruntime.so. Vercel's serverless runtime can't load that .so, so
// /api/match 500s in production. In the BROWSER, @huggingface/transformers
// defaults to its WASM backend (onnxruntime-web) — no native .so — so the same
// model runs fine.
//
// To keep the browser cheap, we DON'T embed the whole graph at runtime: persona
// OFFER vectors are precomputed at build time (scripts/precompute-embeddings.mjs
// → data/seed/embeddings.json, L2-normalized, mean-pooled). At search time we only
// embed the live ASK, then cosine-compare (dot, since vectors are normalized)
// against the precomputed offers. Same model, same pooling, same rank blend as the
// server — so results are identical and the MatchResult shape is unchanged.
// ─────────────────────────────────────────────────────────────────────────────

const MODEL_ID = "Xenova/all-MiniLM-L6-v2";

type PrecomputedVec = { offer: string; vec: number[] };
const PRECOMPUTED = (embeddingsData as { vectors: Record<string, PrecomputedVec> })
  .vectors;

// Minimal structural type for the pipeline — avoids importing the heavy package
// types into the client bundle's type graph just to name a singleton.
type Embedder = (
  text: string,
  opts: { pooling: "mean"; normalize: boolean }
) => Promise<{ data: Float32Array }>;

/** Lazily-created, cached singleton of the embedding pipeline (browser WASM). */
let embedderPromise: Promise<Embedder> | null = null;

/**
 * Load (once) the embedding model. The dynamic import keeps @huggingface/transformers
 * out of the initial bundle and only fetches the model on the first real search;
 * the browser caches the weights afterward. `true` is returned to the caller the
 * first time a download is actually kicked off, so the UI can show a one-time
 * "loading model…" state.
 */
function getEmbedder(): { promise: Promise<Embedder>; cold: boolean } {
  const cold = embedderPromise === null;
  if (!embedderPromise) {
    embedderPromise = import("@huggingface/transformers").then(
      ({ pipeline }) =>
        pipeline("feature-extraction", MODEL_ID) as unknown as Promise<Embedder>
    );
  }
  return { promise: embedderPromise, cold };
}

/** Embed one string → an L2-normalized sentence vector (mean-pooled). */
async function embed(embedder: Embedder, text: string): Promise<Float32Array> {
  const output = await embedder(text, { pooling: "mean", normalize: true });
  return output.data;
}

/** Cosine similarity of two L2-normalized vectors == their dot product. */
function dot(a: ArrayLike<number>, b: ArrayLike<number>): number {
  let sum = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) sum += a[i] * b[i];
  return sum;
}

/**
 * Semantic similarity of an ask vs an offer, mapped into 0..1 — identical clamp
 * to the server engine so scores are comparable across asks.
 */
function similarity(askVec: ArrayLike<number>, offerVec: ArrayLike<number>): number {
  return Math.max(0, Math.min(1, dot(askVec, offerVec)));
}

/** Per-session cache of offer vectors we had to embed on the fly (drifted offers). */
const liveOfferCache = new Map<PersonaId, { offer: string; vec: Float32Array }>();

/**
 * Get a persona's normalized OFFER vector. Uses the precomputed build-time vector
 * when its stored offer text still matches the live graph; otherwise the offer has
 * drifted (e.g. another track edited the seed after embeddings were generated) and
 * we embed it client-side on the fly — so the client never serves a stale vector.
 */
async function offerVecFor(
  embedder: Embedder,
  persona: Persona
): Promise<ArrayLike<number>> {
  const pre = PRECOMPUTED[persona.id];
  if (pre && pre.offer === persona.offer) return pre.vec;

  const cached = liveOfferCache.get(persona.id);
  if (cached && cached.offer === persona.offer) return cached.vec;

  const vec = await embed(embedder, persona.offer);
  liveOfferCache.set(persona.id, { offer: persona.offer, vec });
  return vec;
}

/**
 * Match a live ask against the DECLARED OFFERS of everyone in the warm network
 * (1st + 2nd degree only), ranked by semantic score blended with path warmth.
 * Browser equivalent of lib/engine/match.ts#matchAsk — same blend, same output —
 * with endorsements attached (the server route does that; here we fold it in so
 * the caller gets fully-formed MatchResults).
 *
 * @param onColdLoad fired once, before the model is downloaded the first time, so
 *   the UI can show a one-time "loading model…" state. Not called on warm searches.
 */
export async function matchAskClient(
  graph: Graph,
  ask: string,
  meId: PersonaId = graph.me,
  onColdLoad?: () => void
): Promise<MatchResult[]> {
  const { promise, cold } = getEmbedder();
  if (cold) onColdLoad?.();
  const embedder = await promise;

  const paths = findWarmPaths(graph, meId);
  const byId = new Map(graph.personas.map((p) => [p.id, p]));

  // Candidates = reachable personas (≤2 degrees), excluding "me".
  const candidates: { persona: Persona; path: Path }[] = [];
  for (const [targetId, path] of paths) {
    const persona = byId.get(targetId);
    if (!persona || targetId === meId) continue;
    candidates.push({ persona, path });
  }

  // Embed the ask once, and resolve each candidate offer vector (precomputed or
  // on-the-fly) — in parallel.
  const [askVec, offerVecs] = await Promise.all([
    embed(embedder, ask),
    Promise.all(candidates.map((c) => offerVecFor(embedder, c.persona))),
  ]);

  const results: MatchResult[] = [];
  for (let i = 0; i < candidates.length; i++) {
    const { persona, path } = candidates[i];
    const score = similarity(askVec, offerVecs[i]);

    const warmth = warmthForDegree(path.degree);
    // Rank blend (identical to the server): match quality dominates (0.75) so a
    // strong 2nd-degree hit can outrank a weak 1st-degree one; warmth (0.25)
    // nudges closer connections up when scores are comparable.
    const rank = score * (0.75 + 0.25 * warmth);
    const mutual = path.degree === 2 ? byId.get(path.nodes[1]) : undefined;

    const result: MatchResult = { persona, score, warmth, rank, path, mutual };

    // Attach the mutual's declared vouch (when present), same as /api/match.
    if (mutual) {
      const e = ENDORSEMENTS[`${mutual.id}|${persona.id}`];
      if (e) result.endorsement = e;
    }

    results.push(result);
  }

  results.sort((a, b) => b.rank - a.rank);
  return results;
}
