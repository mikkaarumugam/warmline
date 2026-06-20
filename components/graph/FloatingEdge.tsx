"use client";

import {
  getStraightPath,
  useInternalNode,
  type EdgeProps,
} from "@xyflow/react";

/** Center point of a node (positionAbsolute is the top-left; add half the size). */
function center(node: ReturnType<typeof useInternalNode>) {
  if (!node) return null;
  return {
    x: node.internals.positionAbsolute.x + (node.measured?.width ?? 0) / 2,
    y: node.internals.positionAbsolute.y + (node.measured?.height ?? 0) / 2,
  };
}

/**
 * Obsidian-style edge: a straight line drawn from the CENTER of the source node
 * to the CENTER of the target node. The node discs sit on top of the endpoints,
 * so each line appears to emanate from the middle of the circle.
 */
export function FloatingEdge({
  id,
  source,
  target,
  style,
}: EdgeProps) {
  const s = center(useInternalNode(source));
  const t = center(useInternalNode(target));
  if (!s || !t) return null;

  const [path] = getStraightPath({
    sourceX: s.x,
    sourceY: s.y,
    targetX: t.x,
    targetY: t.y,
  });

  return <path id={id} d={path} className="react-flow__edge-path" style={style} />;
}
