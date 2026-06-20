import type { Graph, Path, PersonaId } from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// Warm-path finding over the (undirected) graph. Shared utility — Track A owns
// /lib/engine/* and can extend this. BFS to depth 2 is plenty: we only surface
// 1st- and 2nd-degree connections (your friends, and friends-of-friends).
// ─────────────────────────────────────────────────────────────────────────────

/** Build an undirected adjacency map from the edge list. */
export function buildAdjacency(graph: Graph): Map<PersonaId, Set<PersonaId>> {
  const adj = new Map<PersonaId, Set<PersonaId>>();
  const link = (a: PersonaId, b: PersonaId) => {
    if (!adj.has(a)) adj.set(a, new Set());
    adj.get(a)!.add(b);
  };
  for (const { source, target } of graph.edges) {
    link(source, target);
    link(target, source);
  }
  return adj;
}

/**
 * Shortest warm path (degree ≤ 2) from `meId` to every reachable persona.
 * Returns a map of targetId → Path. Excludes `meId` itself and direct? no:
 * includes 1st-degree (degree 1) and 2nd-degree (degree 2) targets only.
 * For 2nd-degree, picks one mutual connector (first found via BFS).
 */
export function findWarmPaths(
  graph: Graph,
  meId: PersonaId = graph.me
): Map<PersonaId, Path> {
  const adj = buildAdjacency(graph);
  const paths = new Map<PersonaId, Path>();

  const firstDegree = adj.get(meId) ?? new Set<PersonaId>();

  // Degree 1: direct connections.
  for (const friend of firstDegree) {
    paths.set(friend, { nodes: [meId, friend], degree: 1 });
  }

  // Degree 2: friends-of-friends not already reachable at degree 1.
  for (const friend of firstDegree) {
    const fof = adj.get(friend) ?? new Set<PersonaId>();
    for (const candidate of fof) {
      if (candidate === meId) continue;
      if (firstDegree.has(candidate)) continue; // closer path already exists
      if (paths.has(candidate)) continue; // keep first (any) mutual
      paths.set(candidate, { nodes: [meId, friend, candidate], degree: 2 });
    }
  }

  return paths;
}

/** Warmth score derived from path degree: 1st degree is warmer than 2nd. */
export function warmthForDegree(degree: 1 | 2): number {
  return degree === 1 ? 1 : 0.6;
}
