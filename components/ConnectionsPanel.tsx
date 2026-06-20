"use client";

import { useState } from "react";
import { ChevronDown, Link2 } from "lucide-react";
import type { Persona } from "@/lib/types";
import { initials } from "./ui/cn";

/** A relationship you've activated — accepted an inbound intro or booked an outbound. */
export interface Connection {
  id: string;
  persona: Persona;
  via?: Persona;
  source: "inbound" | "outbound";
}

/**
 * The relationship layer, docked on the graph: the connections your intros have
 * actually created. Click one to highlight its path. Pairs with the green
 * You↔person edges the graph draws for each.
 */
export function ConnectionsPanel({
  connections,
  onSelect,
}: {
  connections: Connection[];
  onSelect: (c: Connection) => void;
}) {
  const [open, setOpen] = useState(true);
  if (connections.length === 0) return null;

  return (
    <div className="pointer-events-auto absolute left-4 top-4 w-60 overflow-hidden rounded-xl border border-emerald-400/20 bg-[#0d0e1a]/85 shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left"
      >
        <Link2 size={14} className="text-emerald-300" />
        <span className="text-[12px] font-semibold text-slate-100">Connections</span>
        <span className="rounded-full bg-emerald-400/15 px-1.5 text-[10px] font-bold tabular-nums text-emerald-200 ring-1 ring-emerald-400/25">
          {connections.length}
        </span>
        <ChevronDown
          size={14}
          className={`ml-auto text-slate-500 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="space-y-0.5 border-t border-white/[0.06] p-1.5">
          {connections.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition hover:bg-white/[0.05]"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/[0.08] text-[9px] font-semibold text-slate-200 ring-1 ring-white/10">
                {initials(c.persona.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-[12px] font-medium text-slate-100">
                  {c.persona.name}
                </p>
                <p className="truncate text-[10px] text-slate-500">
                  {c.source === "inbound" ? "reached out to you" : "you reached out"}
                  {c.via ? ` · via ${c.via.name.split(" ")[0]}` : ""}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
