"use client";

import { Users, Sparkles } from "lucide-react";
import type { Graph, MatchResult } from "@/lib/types";
import { ResultCard } from "./ResultCard";

interface ResultsPanelProps {
  graph: Graph;
  results: MatchResult[];
  loading: boolean;
  searched: boolean;
  selectedId: string | null;
  onSelect: (r: MatchResult) => void;
  onDraft: (r: MatchResult) => void;
}

export function ResultsPanel({
  graph,
  results,
  loading,
  searched,
  selectedId,
  onSelect,
  onDraft,
}: ResultsPanelProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!searched) {
    return (
      <EmptyState
        icon={<Sparkles size={20} />}
        title="Post your ask to see warm intros"
        body="We'll rank people whose declared offer matches — and show the warm path to reach each one."
      />
    );
  }

  if (results.length === 0) {
    return (
      <EmptyState
        icon={<Users size={20} />}
        title="No warm matches yet"
        body="Try rephrasing your ask — describe the role, skill, or domain you need."
      />
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-slate-500">
        {results.length} warm {results.length === 1 ? "match" : "matches"} ·
        ranked by fit &amp; warmth
      </p>
      {results.map((r, i) => (
        <div
          key={r.persona.id}
          className="animate-rise"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <ResultCard
            result={r}
            graph={graph}
            rank={i}
            selected={selectedId === r.persona.id}
            onSelect={() => onSelect(r)}
            onDraft={() => onDraft(r)}
          />
        </div>
      ))}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
      <div className="flex gap-3">
        <div className="skeleton h-11 w-11 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3.5 w-1/3 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
          <div className="skeleton h-3 w-full rounded" />
          <div className="skeleton h-3 w-2/3 rounded" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.02] px-6 py-12 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-400/10 text-indigo-300 ring-1 ring-indigo-400/20">
        {icon}
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-200">{title}</p>
      <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-400">
        {body}
      </p>
    </div>
  );
}
