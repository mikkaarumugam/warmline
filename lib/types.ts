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
