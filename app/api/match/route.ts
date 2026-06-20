import { NextResponse } from "next/server";
import { getGraph } from "@/lib/data";
import { findWarmPaths, warmthForDegree } from "@/lib/engine/paths";
import { ENDORSEMENTS } from "@/data/seed/vouches";
import type {
  MatchRequest,
  MatchResponse,
  MatchResult,
  Path,
  Persona,
} from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// FALLBACK route. The PRIMARY semantic match runs client-side
// (lib/engine/match-client.ts) so it works on Vercel's serverless without the
// native onnxruntime model. The page only POSTs here if the in-browser model
// fails to load.
//
// This route is deliberately MODEL-FREE: it does NOT import the embedding engine,
// so onnxruntime-node (~210 MB of native libs) is never traced into this
// serverless function. It scores with a lightweight lexical overlap instead —
// degraded vs. the semantic ranking, but it always works and never 500s. Same
// MatchResponse shape (the frozen contract), same warm-path BFS + rank blend +
// endorsements as the primary path.
// ─────────────────────────────────────────────────────────────────────────────

export const runtime = "nodejs";

const STOPWORDS = new Set([
  "a", "an", "the", "to", "of", "in", "on", "for", "and", "or", "who", "that",
  "with", "is", "are", "i", "my", "me", "someone", "intro", "knows", "know",
  "looking", "need", "want", "warm",
]);

/** Lowercase word tokens, stopwords removed. */
function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter(
    (t) => t.length > 1 && !STOPWORDS.has(t)
  );
}

/**
 * Lexical similarity in [0,1]: share of the ask's meaningful tokens that appear
 * in the offer. A simple, dependency-free stand-in for the semantic score.
 */
function lexicalScore(askTokens: string[], offer: string): number {
  if (askTokens.length === 0) return 0;
  const offerTokens = new Set(tokenize(offer));
  let hits = 0;
  for (const t of askTokens) if (offerTokens.has(t)) hits++;
  return hits / askTokens.length;
}

// POST /api/match  body: { ask: string, meId?: string } → MatchResponse
export async function POST(req: Request) {
  let body: MatchRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const ask = (body.ask ?? "").trim();
  if (!ask) {
    return NextResponse.json({ error: "ask is required" }, { status: 400 });
  }

  const graph = getGraph();
  const meId = body.meId ?? graph.me;
  const askTokens = tokenize(ask);

  const paths = findWarmPaths(graph, meId);
  const byId = new Map(graph.personas.map((p) => [p.id, p]));

  const results: MatchResult[] = [];
  for (const [targetId, path] of paths as Map<string, Path>) {
    const persona = byId.get(targetId);
    if (!persona || targetId === meId) continue;

    const score = lexicalScore(askTokens, persona.offer);
    const warmth = warmthForDegree(path.degree);
    // Same rank blend as the client/semantic path.
    const rank = score * (0.75 + 0.25 * warmth);
    const mutual: Persona | undefined =
      path.degree === 2 ? byId.get(path.nodes[1]) : undefined;

    const result: MatchResult = { persona, score, warmth, rank, path, mutual };
    if (mutual) {
      const e = ENDORSEMENTS[`${mutual.id}|${persona.id}`];
      if (e) result.endorsement = e;
    }
    results.push(result);
  }

  results.sort((a, b) => b.rank - a.rank);

  const response: MatchResponse = { ask, results };
  return NextResponse.json(response);
}
