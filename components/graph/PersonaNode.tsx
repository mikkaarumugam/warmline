"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn, initials } from "../ui/cn";

export interface PersonaNodeData {
  name: string;
  headline: string;
  color: string;
  isMe: boolean;
  /** BFS distance from "me": 0 = you, 1 = direct, 2 = friend-of-friend. */
  degree: number;
  /** "active" = on the highlighted warm path, "dim" = de-emphasized, "idle" = default. */
  state: "active" | "dim" | "idle";
  /** Role on the path, shown as a small caption when active. */
  pathRole?: "you" | "mutual" | "target";
  [key: string]: unknown;
}

/** Circle diameter (px) by degree — keep in sync with the layout's offset. */
export function nodeDiameter(isMe: boolean, degree: number): number {
  if (isMe) return 64;
  return degree === 1 ? 48 : 36;
}

/**
 * A network node. The measured box is ONLY the circle (so floating edges anchor
 * to the disc center); the name + caption are absolutely positioned below and
 * don't affect the box size.
 */
function PersonaNodeBase({ data }: NodeProps & { data: PersonaNodeData }) {
  const { name, color, isMe, degree, state, pathRole } = data;
  const active = state === "active";
  const dim = state === "dim";
  const d = nodeDiameter(isMe, degree);

  // Declutter: always label you + 1st-degree; 2nd-degree names appear only when
  // on the active path or on hover.
  const labelAlways = isMe || degree === 1 || active;

  return (
    <div
      className={cn(
        "group relative transition-opacity duration-300",
        dim && "opacity-20"
      )}
      style={{ width: d, height: d }}
    >
      <Handle type="target" position={Position.Top} className="!opacity-0" />
      <Handle type="source" position={Position.Bottom} className="!opacity-0" />

      <div
        className={cn(
          "flex h-full w-full items-center justify-center rounded-full font-semibold text-white shadow-md transition-transform duration-300",
          isMe ? "text-base ring-4" : degree === 1 ? "text-sm ring-2" : "text-[11px] ring-2",
          active ? "scale-110 ring-violet-300" : "ring-white"
        )}
        style={{
          background: isMe ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : color,
          boxShadow: active
            ? "0 0 0 4px rgba(139,92,246,0.25), 0 8px 24px rgba(139,92,246,0.45)"
            : undefined,
        }}
      >
        {isMe ? "You" : initials(name)}
      </div>

      {/* name label — absolutely positioned so it doesn't grow the measured box */}
      <div
        className={cn(
          "pointer-events-none absolute left-1/2 top-full mt-1.5 w-[120px] -translate-x-1/2 truncate text-center text-[11px] font-medium leading-tight transition-opacity duration-200",
          active ? "text-slate-900" : "text-slate-600",
          labelAlways ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      >
        {isMe ? "You" : name}
      </div>

      {active && pathRole && pathRole !== "you" && (
        <span
          className={cn(
            "pointer-events-none absolute left-1/2 top-full mt-[22px] -translate-x-1/2 whitespace-nowrap rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
            pathRole === "mutual"
              ? "bg-amber-100 text-amber-700"
              : "bg-violet-100 text-violet-700"
          )}
        >
          {pathRole === "mutual" ? "Mutual" : "Match"}
        </span>
      )}
    </div>
  );
}

export const PersonaNode = memo(PersonaNodeBase);
