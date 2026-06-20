import type { Graph, MatchResult, PersonaId } from "@/lib/types";
import { findWarmPaths, warmthForDegree } from "@/lib/engine/paths";

// ─────────────────────────────────────────────────────────────────────────────
// SPINE STUB — Track A replaces `scoreOffer` with real semantic similarity:
//   local embeddings (transformers.js, no API key) of the live ask vs each
//   persona's declared OFFER (precomputed/cached), then cosine similarity.
// The naive word-overlap below exists only so the API + frontend work today.
// The function SIGNATURE and the MatchResult shape are the frozen contract.
// ─────────────────────────────────────────────────────────────────────────────

const STOP = new Set([
  "a", "an", "the", "to", "of", "and", "or", "for", "in", "on", "at", "i",
  "who", "with", "my", "me", "is", "are", "as", "someone", "intro", "looking",
]);

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

/** Naive overlap score in 0..1. Track A swaps this for embedding cosine. */
function scoreOffer(ask: string, offer: string): number {
  const a = new Set(tokens(ask));
  const b = new Set(tokens(offer));
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / Math.sqrt(a.size * b.size);
}

/**
 * Match a live ask against the DECLARED OFFERS of everyone in the warm network
 * (1st + 2nd degree only), ranked by semantic score × path warmth.
 */
export async function matchAsk(
  graph: Graph,
  ask: string,
  meId: PersonaId = graph.me
): Promise<MatchResult[]> {
  const paths = findWarmPaths(graph, meId);
  const byId = new Map(graph.personas.map((p) => [p.id, p]));

  const results: MatchResult[] = [];
  for (const [targetId, path] of paths) {
    const persona = byId.get(targetId);
    if (!persona || targetId === meId) continue;

    const score = scoreOffer(ask, persona.offer);
    if (score <= 0) continue;

    const warmth = warmthForDegree(path.degree);
    const rank = score * (0.6 + 0.4 * warmth); // blend match quality + warmth
    const mutual =
      path.degree === 2 ? byId.get(path.nodes[1]) : undefined;

    results.push({ persona, score, warmth, rank, path, mutual });
  }

  results.sort((a, b) => b.rank - a.rank);
  return results;
}
