import type { IntroResponse, Persona } from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// The intro is a forwardable note written in the ASKER's (your) own voice,
// addressed to the target. For a 2nd-degree match it references the shared mutual
// (who can vouch — a signal, not a gate). Claude writes the good version in
// lib/intro/claude.ts; this is the deterministic fallback when no key is set.
// ─────────────────────────────────────────────────────────────────────────────

interface DraftArgs {
  me: Persona; // "You" — the asker / author of the note
  target: Persona; // the person you want to reach
  mutual?: Persona; // the shared connection who can vouch (undefined for 1st-degree)
  ask: string;
}

/** Deterministic template fallback — always in the asker's first-person voice. */
export function templateIntro({ me, target, mutual, ask }: DraftArgs): IntroResponse {
  const targetFirst = target.name.split(" ")[0];
  const cleanAsk = ask.replace(/\.$/, "");
  const about = me.offer.replace(/\.$/, "");

  // 2nd degree: your forwardable note to the target, citing the shared mutual.
  if (mutual) {
    const mutualFirst = mutual.name.split(" ")[0];
    const message =
      `Hi ${targetFirst}, I'm reaching out because I'm looking for ${cleanAsk}. ` +
      `A bit about me — ${about}. ` +
      `${mutualFirst} and I know each other, and she suggested you'd be a great person to talk to ` +
      `(she's happy to vouch for the intro). Your background (${target.headline.toLowerCase()}) ` +
      `lines up really well with what I'm after. Would you be open to a quick chat?`;
    return { message, generatedBy: "template" };
  }

  // 1st degree: you reach out to the target directly.
  const message =
    `Hi ${targetFirst}, I'm reaching out because I'm looking for ${cleanAsk}. ` +
    `A bit about me — ${about}. ` +
    `Your background (${target.headline.toLowerCase()}) looks like a great fit. ` +
    `Would you be open to a quick chat?`;
  return { message, generatedBy: "template" };
}
