"use client";

import { ArrowRight, PenLine } from "lucide-react";
import type { MatchResult, Graph } from "@/lib/types";
import { cn, initials } from "./ui/cn";

interface ResultCardProps {
  result: MatchResult;
  graph: Graph;
  selected: boolean;
  rank: number;
  onSelect: () => void;
  onDraft: () => void;
}

export function ResultCard({
  result,
  graph,
  selected,
  rank,
  onSelect,
  onDraft,
}: ResultCardProps) {
  const { persona, score, path, mutual } = result;
  const pct = Math.round(score * 100);
  const meName = graph.personas.find((p) => p.id === graph.me)?.name ?? "You";

  return (
    <button
      onClick={onSelect}
      className={cn(
        "group w-full rounded-2xl border bg-white/[0.03] p-4 text-left backdrop-blur-xl transition-all duration-200",
        selected
          ? "border-violet-400/40 shadow-[0_0_0_1px_rgba(167,139,250,0.35),0_10px_40px_rgba(139,92,246,0.25)] ring-1 ring-violet-400/30"
          : "border-white/[0.07] hover:border-indigo-400/30 hover:bg-white/[0.05] hover:shadow-[0_8px_30px_rgba(99,102,241,0.18)]",
        rank === 0 && !selected && "ring-1 ring-amber-300/25 shadow-[0_0_24px_rgba(251,191,36,0.12)]"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white shadow-[0_0_16px_rgba(0,0,0,0.4)] ring-1 ring-white/10"
          style={{ background: persona.avatarColor ?? "#6366f1" }}
        >
          {initials(persona.name)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="truncate font-semibold text-slate-100">
                {persona.name}
              </span>
              {rank === 0 && (
                <span className="rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-950 shadow-[0_0_12px_rgba(251,191,36,0.45)]">
                  Top match
                </span>
              )}
            </div>
            <MatchScore pct={pct} />
          </div>

          <p className="mt-0.5 truncate text-xs text-slate-400">
            {persona.headline}
          </p>

          <p className="mt-2 line-clamp-2 text-[13px] leading-snug text-slate-300">
            {persona.offer}
          </p>

          {/* badges + warm path */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1",
                path.degree === 1
                  ? "bg-emerald-400/10 text-emerald-300 ring-emerald-400/20"
                  : "bg-indigo-400/10 text-indigo-300 ring-indigo-400/20"
              )}
            >
              {path.degree === 1 ? "1st degree" : "2nd degree"}
            </span>
            {persona.community && (
              <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] font-medium text-slate-400 ring-1 ring-white/10">
                {persona.community}
              </span>
            )}
          </div>

          <div className="mt-2.5 flex items-center gap-1 text-[11px] font-medium text-slate-400">
            <PathPill label={meName} tone="you" />
            <ArrowRight size={11} className="text-slate-600" />
            {mutual && (
              <>
                <PathPill label={mutual.name} tone="mutual" />
                <ArrowRight size={11} className="text-slate-600" />
              </>
            )}
            <PathPill label={persona.name} tone="target" />
          </div>

          <div
            className={cn(
              "grid transition-all duration-300",
              selected
                ? "mt-3 grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            )}
          >
            <div className="overflow-hidden">
              {persona.ask && (
                <p className="mb-2.5 text-[12px] leading-snug text-slate-400">
                  <span className="font-semibold text-amber-200/90">Their ask: </span>
                  {persona.ask}
                </p>
              )}
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onDraft();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    onDraft();
                  }
                }}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-3.5 py-2 text-xs font-semibold text-white shadow-[0_0_16px_rgba(139,92,246,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(139,92,246,0.6)]"
              >
                <PenLine size={13} />
                Draft intro
              </span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

function MatchScore({ pct }: { pct: number }) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <div className="h-1.5 w-12 overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 shadow-[0_0_8px_rgba(167,139,250,0.6)]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-9 text-right text-xs font-semibold tabular-nums text-violet-300">
        {pct}%
      </span>
    </div>
  );
}

function PathPill({
  label,
  tone,
}: {
  label: string;
  tone: "you" | "mutual" | "target";
}) {
  const first = label.split(" ")[0];
  return (
    <span
      className={cn(
        "rounded-md px-1.5 py-0.5 text-[11px] font-semibold ring-1",
        tone === "you" && "bg-white/[0.06] text-slate-300 ring-white/10",
        tone === "mutual" && "bg-amber-400/12 text-amber-200 ring-amber-400/25",
        tone === "target" && "bg-violet-400/12 text-violet-200 ring-violet-400/25"
      )}
    >
      {tone === "you" ? "You" : first}
    </span>
  );
}
