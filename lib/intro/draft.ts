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

/** Deterministic template fallback. Track C adds the Claude path alongside. */
export function templateIntro({ me, target, mutual, ask }: DraftArgs): IntroResponse {
  const connector = mutual?.name?.split(" ")[0] ?? "there";
  const targetFirst = target.name.split(" ")[0];
  const meFirst = me.name === "You" ? "a friend of mine" : me.name;

  const message =
    `Hi ${targetFirst}, hope you're well! ` +
    `I'm connecting you with ${meFirst} — they're ${me.headline.toLowerCase()} ` +
    `and currently looking for ${ask.replace(/\.$/, "")}. ` +
    `Given your background (${target.headline.toLowerCase()}), I thought you two should talk. ` +
    `Mind if I make the intro?\n\n— ${connector}`;

  return { message, generatedBy: "template" };
}
