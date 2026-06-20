import { NextResponse } from "next/server";
import { getGraph } from "@/lib/data";
import { matchAsk } from "@/lib/engine/match";
import type { MatchRequest, MatchResponse } from "@/lib/types";

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
  const response: MatchResponse = { ask, results };
  return NextResponse.json(response);
}
