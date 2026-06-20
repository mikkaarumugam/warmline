import type { Graph } from "@/lib/types";
import { NETWORK } from "@/data/seed/network";

// Single source of the active graph. Track C wired this to the real seed network
// in /data/seed/network.ts (~100 clustered personas with declared offer/ask and
// a hand-curated golden path). Routes import getGraph() only, so this swap
// requires no route changes. Signature is unchanged from the spine.
export function getGraph(): Graph {
  return NETWORK;
}
