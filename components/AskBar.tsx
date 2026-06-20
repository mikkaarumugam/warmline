"use client";

import { Search, Loader2, CornerDownLeft } from "lucide-react";

interface AskBarProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

/** The prominent ask input. Enter or the button fires a match. */
export function AskBar({ value, onChange, onSubmit, loading }: AskBarProps) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
        Your ask
      </label>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!loading) onSubmit();
        }}
        className="group flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 pl-3.5 shadow-sm transition focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-100"
      >
        <Search size={17} className="shrink-0 text-slate-400" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="A technical cofounder who knows payments infrastructure"
          className="min-w-0 flex-1 bg-transparent py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow shadow-indigo-600/25 transition enabled:hover:-translate-y-0.5 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Matching
            </>
          ) : (
            <>
              Find warm intros
              <CornerDownLeft size={14} className="opacity-70" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
