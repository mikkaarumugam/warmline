"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn, initials } from "../ui/cn";

export interface PersonaNodeData {
  name: string;
  headline: string;
  color: string;
  isMe: boolean;
  /** "active" = on the highlighted warm path, "dim" = de-emphasized, "idle" = default. */
  state: "active" | "dim" | "idle";
  /** Role on the path, shown as a small caption when active. */
  pathRole?: "you" | "mutual" | "target";
  [key: string]: unknown;
}

/** A network node: avatar disc + name. Handles are hidden; edges connect center-to-center. */
function PersonaNodeBase({ data }: NodeProps & { data: PersonaNodeData }) {
  const { name, color, isMe, state, pathRole } = data;
  const active = state === "active";
  const dim = state === "dim";

  return (
    <div
      className={cn(
        "group flex flex-col items-center transition-all duration-300",
        dim && "opacity-25"
      )}
    >
      {/* invisible handles so edges can attach */}
      <Handle type="target" position={Position.Top} className="!opacity-0" />
      <Handle type="source" position={Position.Bottom} className="!opacity-0" />

      <div
        className={cn(
          "relative flex items-center justify-center rounded-full font-semibold text-white shadow-md transition-all duration-300",
          isMe ? "h-16 w-16 text-base ring-4" : "h-12 w-12 text-sm ring-2",
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
          "mt-1.5 max-w-[110px] truncate rounded-md px-1.5 text-center text-[11px] font-medium leading-tight transition-colors",
          active ? "text-slate-900" : "text-slate-600"
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
