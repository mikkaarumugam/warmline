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

/** A network node: avatar disc + name. Handles are hidden; edges connect center-to-center. */
function PersonaNodeBase({ data }: NodeProps & { data: PersonaNodeData }) {
  const { name, color, isMe, degree, state, pathRole } = data;
  const active = state === "active";
  const dim = state === "dim";

  // Size by degree so the hierarchy reads at a glance (you ▸ 1st ▸ 2nd).
  const sizeClass = isMe
    ? "h-16 w-16 text-base ring-4"
    : degree === 1
      ? "h-12 w-12 text-sm ring-2"
      : "h-9 w-9 text-[11px] ring-2";

  // Declutter: always label you + 1st-degree; 2nd-degree names appear only when
  // on the active path or on hover.
  const labelAlways = isMe || degree === 1 || active;

  return (
    <div
      className={cn(
        "group flex flex-col items-center transition-all duration-300",
        dim && "opacity-20"
      )}
    >
      <Handle type="target" position={Position.Top} className="!opacity-0" />
      <Handle type="source" position={Position.Bottom} className="!opacity-0" />

      <div
        className={cn(
          "relative flex items-center justify-center rounded-full font-semibold text-white shadow-md transition-all duration-300",
          sizeClass,
          active ? "scale-110 ring-violet-300" : "ring-white"
        )}
        style={{
          background: isMe
            ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
            : color,
          boxShadow: active
            ? "0 0 0 4px rgba(139,92,246,0.25), 0 8px 24px rgba(139,92,246,0.45)"
            : undefined,
        }}
      >
        {isMe ? "You" : initials(name)}
      </div>

      <div
        className={cn(
          "mt-1.5 max-w-[110px] truncate rounded-md px-1.5 text-center text-[11px] font-medium leading-tight transition-opacity duration-200",
          active ? "text-slate-900" : "text-slate-600",
          labelAlways ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      >
        {isMe ? "You" : name}
      </div>

      {active && pathRole && pathRole !== "you" && (
        <span
          className={cn(
            "mt-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
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
