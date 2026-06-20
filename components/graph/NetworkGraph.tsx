"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  type Node,
  type Edge as RFEdge,
} from "@xyflow/react";
import type { Graph, MatchResult } from "@/lib/types";
import { PersonaNode, type PersonaNodeData, nodeDiameter } from "./PersonaNode";
import { FloatingEdge } from "./FloatingEdge";

const nodeTypes = { persona: PersonaNode };
const edgeTypes = { floating: FloatingEdge };

interface NetworkGraphProps {
  graph: Graph;
  /** The currently selected match — its warm path gets highlighted + animated. */
  selected: MatchResult | null;
}

// Ring radii (px): "me" at center, 1st-degree on the inner ring, 2nd-degree
// fanned out beyond the specific 1st-degree contact that connects them.
const R1 = 250;
const R2 = 500;

/** Undirected adjacency map (insertion order preserved, mirroring the engine). */
function adjacency(graph: Graph): Map<string, Set<string>> {
  const adj = new Map<string, Set<string>>();
  const link = (a: string, b: string) => {
    if (!adj.has(a)) adj.set(a, new Set());
    adj.get(a)!.add(b);
  };
  for (const e of graph.edges) {
    link(e.source, e.target);
    link(e.target, e.source);
  }
  return adj;
}

interface LayoutResult {
  positions: Map<string, { x: number; y: number }>;
  degreeOf: Map<string, number>;
  /** Only nodes within the 2-degree warm network are shown. */
  visibleIds: Set<string>;
  /** The clean branching tree: [me→1st] and [1st→its 2nd-degree children]. No stray cross-links. */
  treeEdges: Array<[string, string]>;
}

/**
 * Deterministic ego-network layout rooted at "me":
 *   • me at the center,
 *   • 1st-degree contacts evenly spaced on a ring around me,
 *   • each 2nd-degree node fanned out in the angular wedge of the SPECIFIC
 *     1st-degree contact that connects them — so the graph branches you → 1st →
 *     2nd and every 2nd-degree person visibly hangs off their mutual.
 *
 * Parent assignment mirrors the engine's `findWarmPaths` (first 1st-degree
 * contact, in edge order, that reaches the node), so a node's branch matches the
 * mutual shown in its warm path (e.g. Samuel hangs off Priya).
 *
 * We only lay out the ≤2-degree warm network — matches can only come from there.
 */
function computeLayout(graph: Graph): LayoutResult {
  const adj = adjacency(graph);
  const me = graph.me;

  const positions = new Map<string, { x: number; y: number }>();
  const degreeOf = new Map<string, number>([[me, 0]]);
  const visibleIds = new Set<string>([me]);
  positions.set(me, { x: 0, y: 0 });

  const firstDegree = [...(adj.get(me) ?? [])];
  const firstSet = new Set(firstDegree);

  // Assign each 2nd-degree node to its connector (first 1st-degree contact, in
  // order, that links to it) → that contact's branch.
  const childrenOf = new Map<string, string[]>(firstDegree.map((id) => [id, []]));
  const claimed = new Set<string>();
  for (const fd of firstDegree) {
    for (const nb of adj.get(fd) ?? []) {
      if (nb === me || firstSet.has(nb) || claimed.has(nb)) continue;
      claimed.add(nb);
      childrenOf.get(fd)!.push(nb);
    }
  }

  const n1 = firstDegree.length || 1;
  const wedge = (Math.PI * 2) / n1;
  const treeEdges: Array<[string, string]> = [];

  firstDegree.forEach((fd, i) => {
    const angle = -Math.PI / 2 + (i / n1) * Math.PI * 2; // start at top
    positions.set(fd, { x: Math.cos(angle) * R1, y: Math.sin(angle) * R1 });
    degreeOf.set(fd, 1);
    visibleIds.add(fd);
    treeEdges.push([me, fd]); // you → 1st-degree

    const kids = childrenOf.get(fd)!;
    const span = wedge * 0.72; // fan width, leaves a margin between branches
    kids.forEach((kid, j) => {
      const t = kids.length === 1 ? 0.5 : j / (kids.length - 1);
      const a = angle + (t - 0.5) * span;
      const r = R2 + (j % 2 === 0 ? 0 : 70); // stagger to reduce crowding
      positions.set(kid, { x: Math.cos(a) * r, y: Math.sin(a) * r });
      degreeOf.set(kid, 2);
      visibleIds.add(kid);
      treeEdges.push([fd, kid]); // 1st-degree → its 2nd-degree branch
    });
  });

  return { positions, degreeOf, visibleIds, treeEdges };
}

export function NetworkGraph({ graph, selected }: NetworkGraphProps) {
  const { positions, degreeOf, visibleIds, treeEdges } = useMemo(
    () => computeLayout(graph),
    [graph]
  );

  // ids on the active warm path, in order [me, (mutual), target]
  const pathIds = selected?.path.nodes ?? [];
  const pathSet = new Set(pathIds);
  const pathEdgeKeys = new Set<string>();
  for (let i = 0; i < pathIds.length - 1; i++) {
    pathEdgeKeys.add(edgeKey(pathIds[i], pathIds[i + 1]));
  }
  const hasSelection = pathIds.length > 0;

  const nodes: Node<PersonaNodeData>[] = useMemo(() => {
    return graph.personas
      .filter((p) => visibleIds.has(p.id))
      .map((p) => {
        const onPath = pathSet.has(p.id);
        let pathRole: PersonaNodeData["pathRole"];
        if (onPath) {
          if (p.id === graph.me) pathRole = "you";
          else if (p.id === selected?.persona.id) pathRole = "target";
          else pathRole = "mutual";
        }
        const state: PersonaNodeData["state"] = !hasSelection
          ? "idle"
          : onPath
            ? "active"
            : "dim";
        const isMe = p.id === graph.me;
        const degree = degreeOf.get(p.id) ?? 2;
        const d = nodeDiameter(isMe, degree);
        const c = positions.get(p.id) ?? { x: 0, y: 0 };
        return {
          id: p.id,
          type: "persona",
          // offset by half the circle so the disc CENTER lands on the layout
          // coordinate — floating edges then connect true center-to-center.
          position: { x: c.x - d / 2, y: c.y - d / 2 },
          data: {
            name: p.name,
            headline: p.headline,
            color: p.avatarColor ?? "#94a3b8",
            isMe: p.id === graph.me,
            degree: degreeOf.get(p.id) ?? 2,
            state,
            pathRole,
          },
          draggable: false,
          selectable: false,
        };
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph, positions, selected, hasSelection]);

  const edges: RFEdge[] = useMemo(() => {
    // Only the clean branching tree (you→1st, 1st→2nd) — no stray cross-links.
    return treeEdges.map(([source, target]) => {
      const key = edgeKey(source, target);
      const onPath = pathEdgeKeys.has(key);
      return {
        id: key,
        source,
        target,
        type: "floating",
        className: onPath ? "warm-edge" : undefined,
        animated: false,
        style: onPath
          ? { strokeWidth: 3.5 }
          : {
              stroke: "#cbd5e1",
              strokeWidth: 1.2,
              strokeOpacity: hasSelection ? 0.15 : 0.5,
            },
        zIndex: onPath ? 10 : 0,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeEdges, selected, hasSelection]);

  return (
    <div className="relative h-full w-full">
      <svg className="pointer-events-none absolute h-0 w-0">
        <defs>
          <linearGradient id="warm-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={1.6}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnScroll
        zoomOnDoubleClick={false}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={26}
          size={1.4}
          color="#dcdcef"
        />
      </ReactFlow>
    </div>
  );
}

function edgeKey(a: string, b: string): string {
  return [a, b].sort().join("|");
}
