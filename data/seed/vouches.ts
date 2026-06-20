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

// The mutual vouches FOR YOU (the asker) to the target — backing the person
// making the request, so the target knows it's worth their time. Keyed
// `${mutualId}|${targetId}`. A signal that rides with your request, never a gate.
export const ENDORSEMENTS: Record<string, Endorsement> = {
  // Golden path — Priya backs you to Samuel.
  "priya|samuel": {
    byId: "priya",
    score: 9,
    note: "I've watched them build for a while now — sharp, moves fast, and genuinely serious about ops. Worth your time, Sam.",
  },
  // Priya backs you to Marco.
  "priya|marco": {
    byId: "priya",
    score: 8,
    note: "They actually get the value of good design and they're great to work with. I'd happily put my name behind this one.",
  },
  // Priya backs you to Raj.
  "priya|raj": {
    byId: "priya",
    score: 7,
    note: "Solid founder, clear about what they need. Happy to vouch for the intro.",
  },
  // Noor backs you to Ethan.
  "noor|ethan": {
    byId: "noor",
    score: 8,
    note: "I've seen how they operate — diligent and serious about getting it right. Worth a conversation.",
  },
  // Dana backs you to Priyanka.
  "dana|priyanka": {
    byId: "dana",
    score: 9,
    note: "They're building something real in ops and they're a genuinely good operator. Strongly recommend connecting.",
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
