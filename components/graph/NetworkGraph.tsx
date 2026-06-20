"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  type Node,
  type Edge as RFEdge,
} from "@xyflow/react";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceRadial,
  forceCollide,
  type SimulationNodeDatum,
} from "d3-force";
import type { Graph, MatchResult } from "@/lib/types";
import { PersonaNode, type PersonaNodeData } from "./PersonaNode";

const nodeTypes = { persona: PersonaNode };

interface NetworkGraphProps {
  graph: Graph;
  /** The currently selected match — its warm path gets highlighted + animated. */
  selected: MatchResult | null;
}

// Radius of each degree ring (px). "me" sits at the center, 1st-degree on the
// inner ring, 2nd-degree on the outer ring — so the graph literally branches out.
const RING = 200;

interface SimNode extends SimulationNodeDatum {
  id: string;
  degree: number;
}

/** Undirected adjacency map. */
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

/** BFS distance (degree) from `me` to every reachable node. */
function degrees(graph: Graph, adj: Map<string, Set<string>>): Map<string, number> {
  const dist = new Map<string, number>([[graph.me, 0]]);
  const queue = [graph.me];
  while (queue.length) {
    const cur = queue.shift()!;
    const d = dist.get(cur)!;
    for (const nb of adj.get(cur) ?? []) {
      if (!dist.has(nb)) {
        dist.set(nb, d + 1);
        queue.push(nb);
      }
    }
  }
  return dist;
}

interface LayoutResult {
  positions: Map<string, { x: number; y: number }>;
  degreeOf: Map<string, number>;
  /** Only nodes within the 2-degree warm network are shown. */
  visibleIds: Set<string>;
}

/**
 * Force-directed, Obsidian-style layout rooted at "me". A radial force pins each
 * node to a ring by its BFS degree (you → 1st → 2nd), while link + charge forces
 * let connected people cluster organically and 2nd-degree nodes branch out next
 * to the mutual that connects them. We only lay out the ≤2-degree warm network —
 * matches can only come from there, so showing the rest is just clutter.
 */
function computeLayout(graph: Graph): LayoutResult {
  const adj = adjacency(graph);
  const degreeOf = degrees(graph, adj);

  const visibleIds = new Set<string>(
    [...degreeOf.entries()].filter(([, d]) => d <= 2).map(([id]) => id)
  );

  const simNodes: SimNode[] = [...visibleIds].map((id, i) => {
    const degree = degreeOf.get(id) ?? 2;
    // deterministic seed positions on the ring (golden-angle) so the sim
    // converges to the same organic layout every load.
    const a = i * 2.399963;
    return {
      id,
      degree,
      x: Math.cos(a) * degree * RING,
      y: Math.sin(a) * degree * RING,
      ...(id === graph.me ? { fx: 0, fy: 0 } : {}),
    };
  });

  const links = graph.edges
    .filter((e) => visibleIds.has(e.source) && visibleIds.has(e.target))
    .map((e) => ({ source: e.source, target: e.target }));

  const sim = forceSimulation(simNodes)
    .force(
      "link",
      forceLink(links)
        .id((d) => (d as SimNode).id)
        .distance(96)
        .strength(0.22)
    )
    .force("charge", forceManyBody().strength(-340))
    .force("radial", forceRadial((d) => (d as SimNode).degree * RING, 0, 0).strength(0.85))
    .force("collide", forceCollide(52))
    .stop();

  // run to convergence synchronously (deterministic, ~instant for this size)
  for (let i = 0; i < 420; i++) sim.tick();

  const positions = new Map<string, { x: number; y: number }>();
  for (const n of simNodes) positions.set(n.id, { x: n.x ?? 0, y: n.y ?? 0 });

  return { positions, degreeOf, visibleIds };
}

export function NetworkGraph({ graph, selected }: NetworkGraphProps) {
  const { positions, degreeOf, visibleIds } = useMemo(
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
        return {
          id: p.id,
          type: "persona",
          position: positions.get(p.id) ?? { x: 0, y: 0 },
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
    return graph.edges
      .filter((e) => visibleIds.has(e.source) && visibleIds.has(e.target))
      .map((e) => {
        const key = edgeKey(e.source, e.target);
        const onPath = pathEdgeKeys.has(key);
        return {
          id: key,
          source: e.source,
          target: e.target,
          type: "straight",
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
  }, [graph, selected, hasSelection]);

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
