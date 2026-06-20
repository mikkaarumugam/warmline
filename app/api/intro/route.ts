import { NextResponse } from "next/server";
import { getGraph } from "@/lib/data";
import { templateIntro } from "@/lib/intro/draft";
import type { IntroRequest } from "@/lib/types";

// POST /api/intro  body: IntroRequest → IntroResponse
// Spine uses the template fallback. Track C adds the Claude-powered path here
// (use Claude when ANTHROPIC_API_KEY is set, else fall back to templateIntro).
export async function POST(req: Request) {
  let body: IntroRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const graph = getGraph();
  const byId = new Map(graph.personas.map((p) => [p.id, p]));
  const me = byId.get(graph.me);
  const target = byId.get(body.matchPersonaId);
  if (!me || !target) {
    return NextResponse.json({ error: "unknown persona" }, { status: 404 });
  }
  const mutual = body.mutualId ? byId.get(body.mutualId) : undefined;

  const intro = templateIntro({ me, target, mutual, ask: body.ask ?? target.ask });
  return NextResponse.json(intro);
}
