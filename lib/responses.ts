import type { Persona } from "@/lib/types";

/**
 * Warm one-line acceptances. The recipient "replies with something" — but it's a
 * disposition (accept + a note), not a chat thread: it resolves the request and
 * hands off to booking. Deterministic per person so the same target always says
 * the same thing (a stable demo stand-in for a real reply).
 */
const ACCEPT_NOTES = [
  "Happy to connect — grab whatever time works for you.",
  "Would love to chat. Send a couple of times that suit you?",
  "Open to it — book whatever's easiest and I'll be there.",
  "Glad the timing lined up. Pick a slot and let's talk.",
];

export function acceptNote(persona: Persona): string {
  let sum = 0;
  for (const ch of persona.id) sum += ch.charCodeAt(0);
  return ACCEPT_NOTES[sum % ACCEPT_NOTES.length];
}
