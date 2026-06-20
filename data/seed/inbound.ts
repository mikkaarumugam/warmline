import type { PersonaId } from "@/lib/types";

/**
 * Demo seed for the inbound side: people reaching YOU on a warm path. One is
 * strongly vouched (an easy yes — the vouch doing its real job as decision-support
 * on the recipient side); one has NO vouch yet, to show the request still arrives
 * (signal, not gate). Resolved against the loaded graph in the UI.
 */
export interface InboundSeed {
  id: string;
  requesterId: PersonaId;
  mutualId?: PersonaId;
  endorsement?: { score: number; note?: string };
  ask: string;
  message: string;
}

export const INBOUND_SEED: InboundSeed[] = [
  {
    id: "in-raj",
    requesterId: "raj", // Raj Patel — frontend engineer, dashboards
    mutualId: "priya", // via Priya Nair
    endorsement: {
      score: 9,
      note: "Ships fast with great taste — you'll like how he thinks.",
    },
    ask: "15 minutes on how to model the ledger side of a payments dashboard",
    message:
      "Hi — I'm building a payments analytics dashboard and Priya said you'd have sharp opinions on modelling the ledger. Could I grab 15 minutes sometime?",
  },
  {
    id: "in-victor",
    requesterId: "victor", // Victor Huang — founder, martech
    mutualId: "marcus", // via Marcus Reed (no vouch yet)
    ask: "to compare notes on early B2B go-to-market",
    message:
      "Hi — I'm a few months into a martech startup and wrestling with the same GTM motion you've run. Marcus connected us. Would love to swap notes if you're open.",
  },
];
