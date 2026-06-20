import { NextResponse } from "next/server";
import { getGraph } from "@/lib/data";
import { templateIntro } from "@/lib/intro/draft";
import { claudeIntro } from "@/lib/intro/claude";
import type { IntroRequest, IntroResponse } from "@/lib/types";

// POST /api/intro  body: IntroRequest → IntroResponse
// Uses Claude (Anthropic SDK, claude-sonnet-4-6) to draft the intro in the
// mutual's voice when ANTHROPIC_API_KEY is set. On ANY error — or when the key
// is missing — it falls back to the deterministic templateIntro and returns
// generatedBy: "template". This endpoint must never hard-fail.
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
  const ask = body.ask ?? target.ask;

  const args = { me, target, mutual, ask };

  let intro: IntroResponse;
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      intro = await claudeIntro(args);
    } catch {
      // Claude path failed (network, rate limit, bad key, empty draft, …) —
      // never let the endpoint hard-fail; serve the template instead.
      intro = templateIntro(args);
    }
  } else {
    intro = templateIntro(args);
  }

  return NextResponse.json(intro);
}
