import Anthropic from "@anthropic-ai/sdk";
import type { IntroResponse, Persona } from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// CLAUDE INTRO DRAFT — writes a forwardable note in the ASKER's (your) own voice,
// addressed to the target. For a 2nd-degree match it cites the shared mutual, who
// can vouch (a signal, not a gate). Uses the Anthropic SDK (`new Anthropic()`
// reads ANTHROPIC_API_KEY from env). Model: claude-sonnet-4-6.
//
// The API route (app/api/intro/route.ts) calls this only when ANTHROPIC_API_KEY
// is set, and falls back to `templateIntro` on ANY error. This module therefore
// throws on failure rather than silently degrading — the route owns the fallback.
// ─────────────────────────────────────────────────────────────────────────────

interface DraftArgs {
  me: Persona; // "You" — the asker / author of the note
  target: Persona; // the person you want to reach
  mutual?: Persona; // the shared connection who can vouch (undefined for 1st-degree)
  ask: string;
}

const MODEL = "claude-sonnet-4-6";

function buildPrompt({ me, target, mutual, ask }: DraftArgs): string {
  const cleanAsk = ask.replace(/\.$/, "");

  const lines = [
    `Write a short, warm, forwardable message in the FIRST PERSON ("I"), from the sender directly TO ${target.name}.`,
    ``,
    `About the sender (the author of the note): ${me.offer}`,
    `The sender is looking for: "${cleanAsk}".`,
    `${target.name} (${target.headline}) can help: ${target.offer}`,
  ];

  if (mutual) {
    lines.push(
      `The sender and ${target.name} share a mutual connection, ${mutual.name}, who suggested the connection and is happy to vouch for the sender.`
    );
  }

  lines.push(
    ``,
    `Requirements:`,
    `- First person, in the SENDER's voice${mutual ? ` — NOT ${mutual.name}'s voice` : ""}.`,
    `- 3 to 5 sentences, warm and concise.`,
    ...(mutual
      ? [`- Naturally mention that ${mutual.name} suggested the connection / is vouching.`]
      : []),
    `- Reference specifically why ${target.name}'s background fits what the sender needs.`,
    `- End with double-opt-in framing — ask if they'd be open to a quick chat.`,
    `- Plain text only. No subject line, no markdown, no placeholders like [Name].`,
    `Return only the message body.`
  );

  return lines.join("\n");
}

/**
 * Draft the intro with Claude. Throws on any SDK/network error so the API route
 * can fall back to the deterministic template. Returns generatedBy: "claude".
 */
export async function claudeIntro(args: DraftArgs): Promise<IntroResponse> {
  const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 400,
    system:
      "You write warm, genuine, concise professional introduction messages for a warm-intro marketplace. You sound like a real person, never like a template. You never invent facts beyond what you are told.",
    messages: [{ role: "user", content: buildPrompt(args) }],
  });

  const message = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();

  if (!message) {
    throw new Error("Claude returned an empty intro draft");
  }

  return { message, generatedBy: "claude" };
}
