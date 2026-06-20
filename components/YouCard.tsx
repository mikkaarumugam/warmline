"use client";

import { ArrowUpRight, Target } from "lucide-react";
import type { Persona } from "@/lib/types";

/** Compact identity card for the "You" node: declared offer + ask. */
export function YouCard({ me }: { me: Persona }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold text-white shadow-sm"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
        >
          You
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{me.name}</p>
          <p className="truncate text-xs text-slate-500">{me.headline}</p>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <Declared
          icon={<ArrowUpRight size={12} />}
          label="Offer"
          tone="offer"
          text={me.offer}
        />
        <Declared
          icon={<Target size={12} />}
          label="Ask"
          tone="ask"
          text={me.ask}
        />
      </div>
    </div>
  );
}

function Declared({
  icon,
  label,
  tone,
  text,
}: {
  icon: React.ReactNode;
  label: string;
  tone: "offer" | "ask";
  text: string;
}) {
  return (
    <div className="flex gap-2">
      <span
        className={`mt-0.5 inline-flex h-5 shrink-0 items-center gap-1 rounded-md px-1.5 text-[10px] font-bold uppercase tracking-wide ${
          tone === "offer"
            ? "bg-emerald-50 text-emerald-600"
            : "bg-indigo-50 text-indigo-600"
        }`}
      >
        {icon}
        {label}
      </span>
      <p className="text-xs leading-snug text-slate-600">{text}</p>
    </div>
  );
}
