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
        "group w-full rounded-2xl border bg-white p-4 text-left transition-all duration-200",
        selected
          ? "border-violet-300 shadow-lg shadow-violet-500/10 ring-1 ring-violet-200"
          : "border-slate-200 hover:border-indigo-200 hover:shadow-md"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white shadow-sm"
          style={{ background: persona.avatarColor ?? "#6366f1" }}
        >
          {initials(persona.name)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="truncate font-semibold text-slate-900">
                {persona.name}
              </span>
              {rank === 0 && (
                <span className="rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                  Top match
                </span>
              )}
            </div>
            <MatchScore pct={pct} />
          </div>

          <p className="mt-0.5 truncate text-xs text-slate-500">
            {persona.headline}
          </p>

          <p className="mt-2 line-clamp-2 text-[13px] leading-snug text-slate-600">
            {persona.offer}
          </p>

          {/* badges + warm path */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                path.degree === 1
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-indigo-100 text-indigo-700"
              )}
            >
              {path.degree === 1 ? "1st degree" : "2nd degree"}
            </span>
            {persona.community && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                {persona.community}
              </span>
            )}
          </div>

          <div className="mt-2.5 flex items-center gap-1 text-[11px] font-medium text-slate-500">
            <PathPill label={meName} tone="you" />
            <ArrowRight size={11} className="text-slate-300" />
            {mutual && (
              <>
                <PathPill label={mutual.name} tone="mutual" />
                <ArrowRight size={11} className="text-slate-300" />
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
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 py-2 text-xs font-semibold text-white shadow shadow-indigo-600/25 transition hover:-translate-y-0.5"
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
      <div className="h-1.5 w-12 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-9 text-right text-xs font-semibold tabular-nums text-violet-600">
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
        "rounded-md px-1.5 py-0.5 text-[11px] font-semibold",
        tone === "you" && "bg-slate-100 text-slate-600",
        tone === "mutual" && "bg-amber-100 text-amber-700",
        tone === "target" && "bg-violet-100 text-violet-700"
      )}
    >
      {tone === "you" ? "You" : first}
    </span>
  );
}
