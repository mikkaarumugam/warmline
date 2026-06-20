import type { IntroResponse, Persona } from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// SPINE STUB — Track C replaces this with a Claude call (Anthropic SDK) that
// writes the intro in the MUTUAL's voice, double-opt-in framing. If no
// ANTHROPIC_API_KEY is present it must gracefully fall back to this template so
// the demo never hard-fails. Keep the IntroResponse shape (frozen contract).
// ─────────────────────────────────────────────────────────────────────────────

interface DraftArgs {
  me: Persona; // "You"
  target: Persona; // the person to be introduced to
  mutual?: Persona; // the connector (undefined for 1st-degree)
  ask: string;
}

/**
 * Deterministic template fallback (Claude path lives in lib/intro/claude.ts).
 * Handles both 2nd-degree intros (written in the mutual's voice) and 1st-degree
 * outreach (written by the asker directly) so the message always reads cleanly.
 */
export function templateIntro({ me, target, mutual, ask }: DraftArgs): IntroResponse {
  const targetFirst = target.name.split(" ")[0];
  const meFirst = me.name === "You" ? "a friend of mine" : me.name;
  const cleanAsk = ask.replace(/\.$/, "");

  // 2nd degree: the mutual introduces the asker to the target, in their voice.
  if (mutual) {
    const message =
      `Hi ${targetFirst}, hope you're well! ` +
      `I'm connecting you with ${meFirst} — they're ${me.headline.toLowerCase()} ` +
      `and currently looking for ${cleanAsk}. ` +
      `Given your background (${target.headline.toLowerCase()}), I thought you two should talk. ` +
      `Mind if I connect you two?\n\n— ${mutual.name.split(" ")[0]}`;
    return { message, generatedBy: "template" };
  }

  // 1st degree: the asker reaches out to the target directly.
  const message =
    `Hi ${targetFirst}, hope you're well! ` +
    `I'm currently looking for ${cleanAsk}, and your background ` +
    `(${target.headline.toLowerCase()}) looks like a great fit. ` +
    `Would you be open to a quick chat?`;
  return { message, generatedBy: "template" };
}
