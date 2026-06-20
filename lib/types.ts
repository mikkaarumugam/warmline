// ─────────────────────────────────────────────────────────────────────────────
// FROZEN CONTRACT — do not change shapes without coordinating across all tracks.
// Tracks A (engine), B (frontend), and C (seed/intro) all depend on these types.
// ─────────────────────────────────────────────────────────────────────────────

export type PersonaId = string;

/** A person in the network. `offer` and `ask` are the two-sided DECLARED layer. */
export interface Persona {
  id: PersonaId;
  name: string;
  /** Short role line, e.g. "Payments infra eng, ex-Adyen". */
  headline: string;
  /** Declared: who they are / what they can help with. Matched against others' asks. */
  offer: string;
  /** Declared: what they're currently looking for. */
  ask: string;
  /** Cluster label for layout + realism, e.g. "fintech", "healthtech". */
  community?: string;
  /** Optional UI accent color. */
  avatarColor?: string;
}

/** Undirected connection. Engine treats {source,target} as bidirectional. */
export interface Edge {
  source: PersonaId;
  target: PersonaId;
}

/** The whole warm network, including the seed "you" node. */
export interface Graph {
  /** Id of the "You" node the demo runs from. */
  me: PersonaId;
  personas: Persona[];
  edges: Edge[];
}

/** A warm-intro path from you to a matched person. */
export interface Path {
  /** [meId, targetId] for 1st degree, or [meId, mutualId, targetId] for 2nd. */
  nodes: PersonaId[];
  /** 1 = direct connection, 2 = friend-of-friend. */
  degree: 1 | 2;
}

/**
 * A declared vouch from a mutual: their confidence that this match is worth it.
 * The mutual is NOT a gate — they add signal, not permission. Declared, not inferred.
 */
export interface Endorsement {
  /** The mutual who vouched. */
  byId: PersonaId;
  /** Confidence they back the recommendation, 1..10. */
  score: number;
  /** Optional human note that travels with the vouch. */
  note?: string;
}

/** One ranked match: someone whose declared OFFER matched your ASK. */
export interface MatchResult {
  persona: Persona;
  /** Semantic similarity of your ask vs their offer, 0..1. */
  score: number;
  /** Path warmth, 0..1 (1st degree warmer than 2nd). */
  warmth: number;
  /** Combined ranking value used for sort order. */
  rank: number;
  /** The warm-intro path to reach them. */
  path: Path;
  /** The connector for 2nd-degree matches; undefined when 1st degree. */
  mutual?: Persona;
  /** The mutual's declared vouch for this match, when present. */
  endorsement?: Endorsement;
}

export interface MatchRequest {
  /** The live ask text the user typed. */
  ask: string;
  /** Defaults to graph.me. */
  meId?: PersonaId;
}

export interface MatchResponse {
  ask: string;
  results: MatchResult[];
}

export interface IntroRequest {
  /** The person you want introduced to. */
  matchPersonaId: PersonaId;
  /** The mutual connector (omit for 1st-degree intros). */
  mutualId?: PersonaId;
  /** The ask that triggered this, for context. */
  ask: string;
}

export interface IntroResponse {
  /** The drafted intro message, written in the mutual contact's voice. */
  message: string;
  /** Whether Claude wrote it, or we fell back to a template (no API key). */
  generatedBy: "claude" | "template";
}

/**
 * An inbound vouch request: someone in YOUR network wants to reach a person you
 * also know, and is asking YOU to add a confidence score + note. This is the
 * "voucher" side of the two-sided product — you're both an asker and a voucher.
 */
export interface VouchRequest {
  id: string;
  /** Your contact asking you to vouch for them. */
  requesterId: PersonaId;
  /** Who they want to reach (you're the mutual). */
  targetId: PersonaId;
  /** Why they want the intro. */
  context: string;
}

/** A VouchRequest with its personas resolved, for the inbox UI. */
export interface VouchRequestView {
  id: string;
  requester: Persona;
  target: Persona;
  context: string;
}

/**
 * An INBOUND intro request: someone wants to reach YOU, on a warm path through a
 * mutual who may have vouched. This is the recipient side — you respond with a
 * disposition (accept / decline / not now), with the vouch as decision-support.
 */
export interface InboundRequest {
  id: string;
  /** Who wants to reach you. */
  requesterId: PersonaId;
  /** The mutual on the warm path (omit for a direct 1st-degree reach). */
  mutualId?: PersonaId;
  /** The mutual's vouch backing the requester — signal, optional (never a gate). */
  endorsement?: Endorsement;
  /** What they want from you. */
  ask: string;
  /** Their note to you (forwardable self-intro, the asker's voice). */
  message: string;
}

/** How you've disposed of an inbound request. "open" = still in your queue. */
export type InboundDisposition = "open" | "accepted" | "declined" | "snoozed";

/** An InboundRequest with its personas resolved, for the inbox UI. */
export interface InboundRequestView {
  id: string;
  requester: Persona;
  mutual?: Persona;
  endorsement?: Endorsement;
  ask: string;
  message: string;
}

/**
 * An OUTBOUND intro request you've sent — the mirror of {@link VouchRequest}.
 * Tracked in the "Sent requests" tab so you can see what's pending vs. connected
 * and **resume** it later (reopen the flow, book the call). Carries the original
 * match + drafted intro so the modal can reopen exactly where you left off.
 */
export interface SentRequest {
  /** One per target (de-duped by target id). */
  id: PersonaId;
  /** The original match (target persona, mutual, endorsement, warm path). */
  match: MatchResult;
  /** The drafted note you sent (message + who wrote it). */
  intro: IntroResponse;
  /** "pending" until they respond → "connected" (accepted) or "declined". */
  status: "pending" | "connected" | "declined";
  /** The recipient's one-line reply when they responded (accept note / decline
   *  reason). A disposition, not a chat. Accept notes are generated per-person. */
  responseNote?: string;
  /** Whether you've already booked the call (terminal step). */
  booked?: boolean;
  /** The ask that prompted it — shown on the card so you recall *why*. */
  ask?: string;
  /** Epoch ms when sent — newest first in the list. */
  sentAt: number;
}
