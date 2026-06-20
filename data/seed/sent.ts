import type { PersonaId } from "@/lib/types";

/**
 * Demo seed for the "Sent requests" tab so it tells its story before you send
 * anything live. Raw (ids only) — resolved against the loaded graph in the UI.
 * Deliberately NON-golden-path personas (Marcus 1st-degree, Priyanka via Dana)
 * so the live Samuel send still prepends as a fresh, distinct entry.
 */
export interface SentSeed {
  targetId: PersonaId;
  /** Omit for a 1st-degree (direct) request. */
  mutualId?: PersonaId;
  status: "pending" | "connected" | "declined";
  message: string;
  ask: string;
  /** The recipient's one-line reply (for connected/declined) — their disposition,
   *  not a chat. Accept notes are generated; only declines are seeded. */
  responseNote?: string;
  /** How long ago it was "sent" — drives newest-first ordering. */
  ageMinutes: number;
}

export const SENT_SEED: SentSeed[] = [
  {
    targetId: "marcus", // Marcus Reed — B2B growth marketer (1st degree)
    status: "pending",
    ask: "a B2B growth marketer who can build our pipeline",
    message:
      "Hi Marcus — I'm standing up our B2B pipeline from scratch and would love your read on what to prioritize first. Would you be open to a quick call?",
    ageMinutes: 180, // ~3h ago
  },
  {
    targetId: "priyanka", // Priyanka Menon — healthtech recruiter (2nd degree)
    mutualId: "dana", // via Dana Levin
    status: "connected",
    ask: "an intro to someone hiring in healthtech",
    message:
      "Hi Priyanka — I'm hiring for a healthtech role and Dana thought we should connect. Would you be open to a quick chat about who you're placing right now?",
    ageMinutes: 2880, // ~2d ago
  },
  {
    targetId: "noor", // Noor Haddad — VC associate, fintech & infra (1st degree)
    status: "declined",
    ask: "an intro to a fintech investor for our seed round",
    message:
      "Hi Noor — we're raising a seed round for our payments tooling and I'd value your perspective. Open to a quick intro?",
    responseNote:
      "We're not active at seed right now — would love to reconnect when you raise your A.",
    ageMinutes: 1440, // ~1d ago
  },
];
