import Anthropic from "@anthropic-ai/sdk";
import type { IntroResponse, Persona } from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// CLAUDE INTRO DRAFT — writes the warm intro in the MUTUAL contact's voice with
// double-opt-in framing. Uses the Anthropic SDK (`new Anthropic()` reads
// ANTHROPIC_API_KEY from env). Model: claude-sonnet-4-6.
//
// The API route (app/api/intro/route.ts) calls this only when ANTHROPIC_API_KEY
// is set, and falls back to `templateIntro` on ANY error. This module therefore
// throws on failure rather than silently degrading — the route owns the fallback.
// ─────────────────────────────────────────────────────────────────────────────

interface DraftArgs {
  me: Persona; // "You" — the asker
  target: Persona; // the person to be introduced to
  mutual?: Persona; // the connector (undefined for 1st-degree)
  ask: string;
}

const MODEL = "claude-sonnet-4-6";

function buildPrompt({ me, target, mutual, ask }: DraftArgs): string {
  const asker = me.name === "You" ? "a founder I know" : me.name;
  const writer = mutual?.name ?? "you";
  const cleanAsk = ask.replace(/\.$/, "");

  // For a 1st-degree match the asker IS connected directly, so the intro is
  // written by the asker reaching out. For a 2nd-degree match the MUTUAL writes
  // it, connecting the asker to the target.
  if (!mutual) {
    return [
      `Write a short, warm outreach message from ${asker} directly to ${target.name}.`,
      `${asker} is reaching out because they're looking for: "${cleanAsk}".`,
      `${target.name}'s background: ${target.headline}. They can help with: ${target.offer}`,
      ``,
      `Requirements:`,
      `- 3 to 5 sentences, friendly and concise.`,
      `- Reference specifically why ${target.name}'s offer fits the ask.`,
      `- Use double-opt-in framing — end by asking if they'd be open to a quick chat.`,
      `- Plain text only. No subject line, no markdown, no placeholders like [Name].`,
      `Return only the message body.`,
    ].join("\n");
  }

  return [
    `You are ${writer}. Write a warm, double-opt-in introduction message that ${writer} would send to ${target.name}, offering to connect them with ${asker}.`,
    ``,
    `Context:`,
    `- ${asker} is looking for: "${cleanAsk}".`,
    `- ${target.name} (${target.headline}) can help: ${target.offer}`,
    `- ${writer} knows both people and is making a warm intro.`,
    ``,
    `Requirements:`,
    `- Write in ${writer}'s first-person voice.`,
    `- 3 to 5 sentences, warm and concise.`,
    `- Explain specifically why ${target.name}'s offer is a strong fit for what ${asker} needs.`,
    `- Use double-opt-in framing — explicitly ask ${target.name} if they'd be open to the intro (e.g. "mind if I connect you two?").`,
    `- Plain text only. No subject line, no markdown, no placeholders like [Name].`,
    `Return only the message body.`,
  ].join("\n");
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
