import type { Endorsement, VouchRequest } from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// VOUCH layer — the declared trust signal on top of the warm graph.
//
// Two sides of the same mechanic:
//  • ENDORSEMENTS — vouches you RECEIVE: a mutual's confidence in a match,
//    keyed by `${mutualId}|${targetId}`, attached to MatchResults at match time.
//  • VOUCH_REQUESTS — vouches you're asked to GIVE: people in your network who
//    want you to back them to someone you also know (the inbox / voucher side).
//
// The mutual is never a gate — they add signal, not permission. Declared, not
// inferred, consistent with the rest of the product.
// ─────────────────────────────────────────────────────────────────────────────

/** Vouches the mutual has declared for a target, keyed `${mutualId}|${targetId}`. */
export const ENDORSEMENTS: Record<string, Endorsement> = {
  // Golden path — Priya backs Samuel.
  "priya|samuel": {
    byId: "priya",
    score: 9,
    note: "Sam built our ledger at Adyen — the best payments engineer I know. Snap him up before someone else does.",
  },
  // "designer who has worked on money flows" — Priya backs Marco.
  "priya|marco": {
    byId: "priya",
    score: 8,
    note: "Marco redesigned our checkout end to end. Money-flows UX is genuinely his superpower.",
  },
  // fintech dashboards — Priya backs Raj.
  "priya|raj": {
    byId: "priya",
    score: 7,
    note: "Raj shipped our analytics dashboards fast and they just worked. Reliable hire.",
  },
  // compliance — Noor backs Ethan.
  "noor|ethan": {
    byId: "noor",
    score: 8,
    note: "Ethan ran compliance at one of our portfolio companies — razor sharp on KYC and licensing.",
  },
  // healthtech hiring — Dana backs Priyanka.
  "dana|priyanka": {
    byId: "dana",
    score: 9,
    note: "Priyanka built our clinical hiring pipeline from scratch. If you're hiring in healthtech, talk to her.",
  },
};

/** Inbound requests asking YOU to vouch (you're the mutual connecting them). */
export const VOUCH_REQUESTS: VouchRequest[] = [
  {
    id: "vr-marcus-noor",
    requesterId: "marcus",
    targetId: "noor",
    context:
      "I'm raising a pre-seed for my martech idea — would love a warm intro to Noor. Can you vouch?",
  },
  {
    id: "vr-dana-mia",
    requesterId: "dana",
    targetId: "mia",
    context:
      "Scaling my clinic's eng team and Mia places amazing engineers. Mind backing me to her?",
  },
  {
    id: "vr-sara-priya",
    requesterId: "sara",
    targetId: "priya",
    context:
      "Need a fintech-savvy product designer for my MVP. Could you vouch for me to Priya?",
  },
];
