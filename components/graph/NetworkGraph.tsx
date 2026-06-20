"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useUpdateNodeInternals,
  type Node,
  type Edge as RFEdge,
  type ReactFlowInstance,
} from "@xyflow/react";
import type { Graph, MatchResult } from "@/lib/types";
import { PersonaNode, type PersonaNodeData, nodeDiameter } from "./PersonaNode";
import { FloatingEdge } from "./FloatingEdge";

const nodeTypes = { persona: PersonaNode };
const edgeTypes = { floating: FloatingEdge };

type XY = { x: number; y: number };

interface NetworkGraphProps {
  graph: Graph;
  /** The currently selected match — its warm path gets highlighted + animated. */
  selected: MatchResult | null;
  /** People you've activated a connection with — drawn as direct You↔person edges. */
  connectionIds?: string[];
  /** Called when the connection reveal finishes — lets the parent reset to the
   *  neutral (unsearched) view by clearing the selection. */
  onRevealDone?: () => void;
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
  /** Full undirected adjacency — used to reveal a new connection's own contacts. */
  adj: Map<string, Set<string>>;
  /** 3rd-degree nodes pre-placed (collapsed on their parent) so they exist from
   *  mount; rendered invisible until a connection reveals them. */
  hiddenIds: Set<string>;
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

  // Pre-place every 2nd-degree node's *own* contacts (3rd degree) collapsed onto
  // their parent, so they exist in the node set from mount (measured, stable).
  // They render invisible until a connection reveals them — adding nodes *later*
  // is what makes React Flow flash/reset them to the origin.
  const hiddenIds = new Set<string>();
  for (const [id, deg] of degreeOf) {
    if (deg !== 2) continue;
    const at = positions.get(id)!;
    for (const nb of adj.get(id) ?? []) {
      if (nb === me || visibleIds.has(nb) || hiddenIds.has(nb)) continue;
      positions.set(nb, { x: at.x, y: at.y }); // collapsed on parent
      degreeOf.set(nb, 3);
      hiddenIds.add(nb);
    }
  }

  return { positions, degreeOf, visibleIds, treeEdges, adj, hiddenIds };
}

export function NetworkGraph({
  graph,
  selected,
  connectionIds,
  onRevealDone,
}: NetworkGraphProps) {
  const { positions, degreeOf, visibleIds, treeEdges, adj, hiddenIds } = useMemo(
    () => computeLayout(graph),
    [graph]
  );

  // ── Accepted connections slide from 2nd-degree (R2) into the 1st-degree ring
  //    (R1), at their existing angle. Driven by rAF on the real node positions so
  //    the emerald edge tracks the node frame-by-frame (a CSS transition wouldn't).
  const connSet = useMemo(() => new Set(connectionIds ?? []), [connectionIds]);
  const [animPos, setAnimPos] = useState<Record<string, XY>>({});
  const tweensRef = useRef<Map<string, { from: XY; to: XY; start: number }>>(new Map());
  const promotedRef = useRef<Set<string>>(new Set());
  const landingRef = useRef<Map<string, XY>>(new Map());
  const rafRef = useRef<number | null>(null);
  // parents whose own contacts have been revealed as a new branch (post-landing)
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  // true during the ~10s cinematic reveal: we zoom in, so off-focus edges are
  // hidden (no lines trailing off-screen) until we settle back to the full view.
  const [revealing, setRevealing] = useState(false);
  const rfRef = useRef<ReactFlowInstance<Node<PersonaNodeData>, RFEdge> | null>(
    null
  );

  const runTweens = useCallback(() => {
    if (rafRef.current != null) return;
    const step = (now: number) => {
      const updates: Record<string, XY> = {};
      for (const [id, tw] of tweensRef.current) {
        const t = Math.min(1, (now - tw.start) / 2000);
        const e = 1 - Math.pow(1 - t, 3); // easeOutCubic
        updates[id] = {
          x: tw.from.x + (tw.to.x - tw.from.x) * e,
          y: tw.from.y + (tw.to.y - tw.from.y) * e,
        };
        if (t >= 1) tweensRef.current.delete(id);
      }
      setAnimPos((prev) => ({ ...prev, ...updates }));
      rafRef.current = tweensRef.current.size ? requestAnimationFrame(step) : null;
    };
    rafRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    const promotedNow: string[] = [];
    for (const id of connSet) {
      if (degreeOf.get(id) !== 2 || promotedRef.current.has(id)) continue;
      const from = positions.get(id);
      if (!from) continue;
      // land on the ring at the node's angle, but nudged out of any existing
      // 1st-degree node's space (so it doesn't crowd its own mutual).
      let ang = Math.atan2(from.y, from.x);
      const ringAngles = [...positions]
        .filter(([rid]) => rid !== id && (degreeOf.get(rid) === 1 || promotedRef.current.has(rid)))
        .map(([, p]) => Math.atan2(p.y, p.x));
      const minGap = 0.42; // ~24°
      for (let i = 0; i < 10; i++) {
        let nearest = 0;
        for (const ra of ringAngles) {
          const dd = Math.atan2(Math.sin(ang - ra), Math.cos(ang - ra));
          if (Math.abs(dd) < Math.abs(nearest) || nearest === 0) nearest = dd;
        }
        if (ringAngles.length === 0 || Math.abs(nearest) >= minGap) break;
        ang += (nearest >= 0 ? 1 : -1) * (minGap - Math.abs(nearest));
      }
      promotedRef.current.add(id);
      const to = { x: Math.cos(ang) * R1, y: Math.sin(ang) * R1 };
      landingRef.current.set(id, to);
      tweensRef.current.set(id, { from, to, start: performance.now() });
      promotedNow.push(id);
    }
    if (promotedNow.length === 0) return;

    // ── a ~10s cinematic reveal, then back to the neutral full view ──
    setRevealing(true);
    runTweens();
    const inst = rfRef.current;
    // include the warm-path nodes (e.g. the mutual) so the highlighted path
    // stays fully in-frame — no edge trailing off to an off-screen node.
    const pathNodes = selected?.path.nodes ?? [];
    const frame = (extra: string[]) =>
      [...new Set([graph.me, ...promotedNow, ...pathNodes, ...extra])].map((id) => ({
        id,
      }));
    const timers: ReturnType<typeof setTimeout>[] = [];

    // 1) zoom toward You + the incoming node as it glides in (~2s glide). Off-path
    //    edges are hidden (revealing) so nothing trails off this tight frame.
    inst?.fitView({ nodes: frame([]), duration: 1200, padding: 0.5, maxZoom: 1.15 });
    // 2) ~3s: pull back to the full view + restore edges (branch not added yet).
    timers.push(
      setTimeout(() => {
        setRevealing(false);
        inst?.fitView({ duration: 1300, padding: 0.2 });
      }, 3000)
    );
    // 3) ~4.8s: with the camera now STATIC, pop the contacts in as a new branch.
    //    Adding nodes mid-animation makes React Flow briefly render them at the
    //    origin (on top of "You") before they settle — doing it static avoids that.
    timers.push(
      setTimeout(() => setRevealed((prev) => new Set([...prev, ...promotedNow])), 4800)
    );
    // 4) ~5.2s: gently re-fit so the new branch is in view.
    timers.push(setTimeout(() => inst?.fitView({ duration: 900, padding: 0.2 }), 5200));
    // 5) ~10s: drop the highlight → the neutral, unsearched view, now with the
    //    new connection + its branch as permanent additions.
    timers.push(setTimeout(() => onRevealDone?.(), 9800));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connSet, positions, degreeOf]);

  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  // ids on the active warm path, in order [me, (mutual), target]
  const pathIds = selected?.path.nodes ?? [];
  const pathSet = new Set(pathIds);
  const pathEdgeKeys = new Set<string>();
  for (let i = 0; i < pathIds.length - 1; i++) {
    pathEdgeKeys.add(edgeKey(pathIds[i], pathIds[i + 1]));
  }
  const hasSelection = pathIds.length > 0;

  // A connection's own contacts, fanned out just beyond it as a new branch.
  const branch = useMemo(() => {
    const childPos = new Map<string, XY>();
    const childEdges: Array<[string, string]> = [];
    for (const parent of revealed) {
      const land = landingRef.current.get(parent) ?? positions.get(parent);
      if (!land) continue;
      const kids = [...(adj.get(parent) ?? [])].filter(
        (n) => n !== graph.me && !visibleIds.has(n)
      );
      const base = Math.atan2(land.y, land.x);
      const span = Math.min(0.5, 0.16 * kids.length);
      kids.forEach((kid, j) => {
        const t = kids.length === 1 ? 0.5 : j / (kids.length - 1);
        const a = base + (t - 0.5) * span;
        // a distinct arc *beyond* the existing 2nd-degree ring, so the branch
        // reads as Sam's own reach rather than blending into your current network
        const r = R2 + 150 + (j % 2 === 0 ? 0 : 70); // stagger
        childPos.set(kid, { x: Math.cos(a) * r, y: Math.sin(a) * r });
        childEdges.push([parent, kid]);
      });
    }
    return { childPos, childEdges };
  }, [revealed, adj, visibleIds, positions, graph.me]);

  const revealedContactIds = useMemo(
    () => [...branch.childPos.keys()],
    [branch]
  );

  const baseNodes: Node<PersonaNodeData>[] = useMemo(() => {
    const d2 = nodeDiameter(false, 2);
    return graph.personas
      .filter(
        (p) =>
          visibleIds.has(p.id) || hiddenIds.has(p.id) || branch.childPos.has(p.id)
      )
      .map((p) => {
        const childC = branch.childPos.get(p.id);
        // a revealed contact: out in the branch arc, visible
        if (childC) {
          return {
            id: p.id,
            type: "persona",
            position: { x: childC.x - d2 / 2, y: childC.y - d2 / 2 },
            // fade-in animates OPACITY ONLY. (animate-pop animates `transform`,
            // which with fill:both permanently overrides React Flow's
            // `transform: translate(...)` and snaps the node to the origin — the
            // real cause of "KM on You".)
            className: "animate-fade-in",
            width: d2,
            height: d2,
            measured: { width: d2, height: d2 },
            data: {
              name: p.name,
              headline: p.headline,
              color: p.avatarColor ?? "#94a3b8",
              isMe: false,
              degree: 2,
              state: "idle" as const,
            },
            draggable: false,
            selectable: false,
          };
        }
        // a pre-placed contact, not yet revealed: collapsed on its parent, invisible
        // (present from mount so revealing is a position/opacity change, never an add)
        if (hiddenIds.has(p.id) && !visibleIds.has(p.id)) {
          const c = positions.get(p.id) ?? { x: 0, y: 0 };
          return {
            id: p.id,
            type: "persona",
            position: { x: c.x - d2 / 2, y: c.y - d2 / 2 },
            width: d2,
            height: d2,
            measured: { width: d2, height: d2 },
            style: { opacity: 0, pointerEvents: "none" as const },
            data: {
              name: p.name,
              headline: p.headline,
              color: p.avatarColor ?? "#94a3b8",
              isMe: false,
              degree: 2,
              state: "idle" as const,
            },
            draggable: false,
            selectable: false,
          };
        }
        return mapNode(p);
      });

    function mapNode(p: (typeof graph.personas)[number]): Node<PersonaNodeData> {
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
        // an accepted connection reads as 1st-degree (bigger, always labelled)
        const connected = !isMe && connSet.has(p.id);
        const degree = connected ? 1 : degreeOf.get(p.id) ?? 2;
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
            isMe,
            degree,
            state,
            pathRole,
          },
          draggable: false,
          selectable: false,
        };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph, positions, selected, hasSelection, connSet, branch, hiddenIds]);

  // Apply the live glide positions as a thin overlay: only the node(s) actually
  // moving get a new object reference, so React Flow re-measures just those — the
  // rest keep their refs and their floating edges stay rendered (no flicker).
  const nodes = useMemo(
    () =>
      baseNodes.map((n) => {
        const ap = animPos[n.id];
        if (!ap) return n;
        const d = nodeDiameter(n.data.isMe, n.data.degree);
        return { ...n, position: { x: ap.x - d / 2, y: ap.y - d / 2 } };
      }),
    [baseNodes, animPos]
  );

  const edges: RFEdge[] = useMemo(() => {
    // The clean branching tree (you→1st, 1st→2nd) — no stray cross-links.
    const tree: RFEdge[] = treeEdges.map(([source, target]) => {
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
          ? { strokeWidth: 5 }
          : {
              stroke: "#5b6178",
              strokeWidth: 1.1,
              // hide off-path edges during the zoomed reveal so none trail
              // off-screen as "lines to nowhere"
              strokeOpacity: revealing ? 0 : hasSelection ? 0.12 : 0.38,
            },
        zIndex: onPath ? 10 : 0,
      };
    });

    // Activated connections — a direct You↔person edge that grows the network.
    const conns: RFEdge[] = (connectionIds ?? [])
      .filter((id) => id !== graph.me && visibleIds.has(id))
      .map((id) => ({
        id: `conn-${id}`,
        source: graph.me,
        target: id,
        type: "floating",
        className: "connection-edge",
        animated: false,
        style: { strokeWidth: 3 },
        zIndex: 9,
      }));

    // A revealed connection's own contacts hang off it like any 2nd-degree branch.
    const branchEdges: RFEdge[] = branch.childEdges.map(([source, target]) => ({
      id: edgeKey(source, target),
      source,
      target,
      type: "floating",
      animated: false,
      style: {
        stroke: "#5b6178",
        strokeWidth: 1.1,
        strokeOpacity: hasSelection ? 0.12 : 0.45,
      },
      zIndex: 0,
    }));

    return [...tree, ...conns, ...branchEdges];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeEdges, selected, hasSelection, connectionIds, visibleIds, branch, revealing]);

  return (
    <div className="relative h-full w-full">
      <svg className="pointer-events-none absolute h-0 w-0">
        <defs>
          {/* userSpaceOnUse (not the default objectBoundingBox): an objectBoundingBox
              gradient is ignored by SVG on a shape with zero width/height — i.e. a
              perfectly vertical/horizontal edge (e.g. you → a contact at the top of the
              ring) — leaving that segment unpainted. Anchoring the gradient to the flow
              coordinate space (which pans/zooms with the edges) paints every segment and
              gives all warm edges one consistent diagonal wash. Span covers the layout
              extent (R2 + stagger ≈ ±570). */}
          <linearGradient
            id="warm-gradient"
            gradientUnits="userSpaceOnUse"
            x1={-R2 - 70}
            y1={-R2 - 70}
            x2={R2 + 70}
            y2={R2 + 70}
          >
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="45%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#f472b6" />
          </linearGradient>
        </defs>
      </svg>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onInit={(inst) => {
          rfRef.current = inst;
        }}
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
          gap={28}
          size={1.3}
          color="#2a2d44"
        />
        <NodeInternalsFixer ids={revealedContactIds} />
      </ReactFlow>
    </div>
  );
}

function edgeKey(a: string, b: string): string {
  return [a, b].sort().join("|");
}

/**
 * Rendered inside <ReactFlow> (so it can use the store): when branch contacts are
 * added dynamically, force React Flow to re-measure them. Without this their
 * internals/positions settle unreliably → nodes stack or edges fail to anchor
 * ("branch off to no one").
 */
function NodeInternalsFixer({ ids }: { ids: string[] }) {
  const update = useUpdateNodeInternals();
  const key = ids.join(",");
  useEffect(() => {
    if (!ids.length) return;
    // a couple of nudges across frames covers the mount + measure race
    const t1 = setTimeout(() => update(ids), 50);
    const t2 = setTimeout(() => update(ids), 250);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return null;
}
