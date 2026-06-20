import { NextResponse } from "next/server";
import { getGraph } from "@/lib/data";
import { matchAsk, warmup } from "@/lib/engine/match";
import { ENDORSEMENTS } from "@/data/seed/vouches";
import type { MatchRequest, MatchResponse } from "@/lib/types";

// transformers.js needs the Node runtime (not Edge).
export const runtime = "nodejs";

// Best-effort warmup: load the embedding model + pre-embed persona offers on
// first import so the initial real request isn't paying for the cold start.
void warmup(getGraph());

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
  const results = await matchAsk(graph, ask, body.meId ?? graph.me);

  // Attach the mutual's declared vouch (when present) to each match.
  for (const r of results) {
    if (r.mutual) {
      const e = ENDORSEMENTS[`${r.mutual.id}|${r.persona.id}`];
      if (e) r.endorsement = e;
    }
  }

  const response: MatchResponse = { ask, results };
  return NextResponse.json(response);
}
