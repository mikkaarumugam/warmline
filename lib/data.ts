import type { Graph } from "@/lib/types";
import { MOCK_GRAPH } from "@/lib/mock";

// Single source of the active graph. Track C swaps the internals to load the
// real seed network from /data/seed/* (JSON). Routes import getGraph() only, so
// this swap requires no route changes.
export function getGraph(): Graph {
  return MOCK_GRAPH;
}
