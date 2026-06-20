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
import { PersonaNode, type PersonaNodeData } from "./PersonaNode";

const nodeTypes = { persona: PersonaNode };

interface NetworkGraphProps {
  graph: Graph;
  /** The currently selected match — its warm path gets highlighted + animated. */
  selected: MatchResult | null;
}

/** Deterministic radial layout: "me" centered, everyone else on rings grouped by community. */
function layout(graph: Graph): Map<string, { x: number; y: number }> {
  const pos = new Map<string, { x: number; y: number }>();
  const center = { x: 0, y: 0 };
  pos.set(graph.me, center);

  const others = graph.personas.filter((p) => p.id !== graph.me);

  // group by community for coherent clusters
  const groups = new Map<string, string[]>();
  for (const p of others) {
    const key = p.community ?? "other";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p.id);
  }

  const communities = [...groups.keys()];
  const radius = 320;
  const jitter = 70;

  communities.forEach((comm, ci) => {
    const ids = groups.get(comm)!;
    // each community occupies an angular wedge
    const wedgeCenter = (ci / communities.length) * Math.PI * 2;
    const wedgeSpan = (Math.PI * 2) / communities.length;
    ids.forEach((id, i) => {
      const t = ids.length === 1 ? 0.5 : i / (ids.length - 1);
      const angle = wedgeCenter + (t - 0.5) * wedgeSpan * 0.8;
      const r = radius + (i % 2 === 0 ? 0 : jitter);
      pos.set(id, {
        x: center.x + Math.cos(angle) * r,
        y: center.y + Math.sin(angle) * r,
      });
    });
  });

  return pos;
}

export function NetworkGraph({ graph, selected }: NetworkGraphProps) {
  const positions = useMemo(() => layout(graph), [graph]);

  // ids on the active warm path, in order [me, (mutual), target]
  const pathIds = selected?.path.nodes ?? [];
  const pathSet = new Set(pathIds);
  // ordered edge keys along the path, e.g. "me|priya", "priya|samuel"
  const pathEdgeKeys = new Set<string>();
  for (let i = 0; i < pathIds.length - 1; i++) {
    pathEdgeKeys.add(edgeKey(pathIds[i], pathIds[i + 1]));
  }
  const hasSelection = pathIds.length > 0;

  const nodes: Node<PersonaNodeData>[] = useMemo(() => {
    return graph.personas.map((p) => {
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
    return graph.edges.map((e) => {
      const key = edgeKey(e.source, e.target);
      const onPath = pathEdgeKeys.has(key);
      return {
        id: key,
        source: e.source,
        target: e.target,
        type: "default",
        className: onPath ? "warm-edge" : undefined,
        animated: false,
        style: onPath
          ? { strokeWidth: 3.5 }
          : {
              stroke: "#cbd5e1",
              strokeWidth: 1.3,
              strokeOpacity: hasSelection ? 0.18 : 0.55,
            },
        zIndex: onPath ? 10 : 0,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph, selected, hasSelection]);

  return (
    <div className="relative h-full w-full">
      {/* gradient + glow defs for the warm-path edges */}
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
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.4}
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
  // undirected: order-independent key so path edges match graph edges
  return [a, b].sort().join("|");
}
