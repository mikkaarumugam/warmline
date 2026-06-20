"use client";

import { TrendingUp } from "lucide-react";
import type { SentRequest } from "@/lib/types";
import { NETWORK_STATS } from "@/data/seed/stats";

/**
 * A light, pitch-ready read on connection outcomes. The headline is the **vouch
 * lift** (acceptance with vs without a vouch) — the metric that proves vouch =
 * signal. The funnel below reflects YOUR live sent requests. All derived from
 * data already in memory — no tracking infra.
 */
export function ConnectStats({ requests }: { requests: SentRequest[] }) {
  const requested = requests.length;
  const accepted = requests.filter((r) => r.status === "connected").length;
  const booked = requests.filter((r) => r.booked).length;

  const { vouched, unvouched } = NETWORK_STATS;
  const vRate = Math.round((vouched.accepted / vouched.sent) * 100);
  const uRate = Math.round((unvouched.accepted / unvouched.sent) * 100);
  const lift = (vRate / uRate).toFixed(1);

  return (
    <div className="rounded-2xl border border-violet-400/15 bg-violet-400/[0.05] p-3.5">
      <div className="flex items-center gap-1.5 text-[13px] font-semibold text-violet-100">
        <TrendingUp size={14} className="text-violet-300" />
        Vouched intros get accepted {lift}× more
      </div>
      <p className="mt-0.5 text-[11px] text-slate-400">
        <span className="font-semibold text-emerald-300">{vRate}%</span> accept with a
        vouch vs <span className="font-semibold text-slate-300">{uRate}%</span> without —
        the signal that moves the needle.
      </p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Stat label="Requested" value={requested} />
        <Stat label="Accepted" value={accepted} tone="emerald" />
        <Stat label="Booked" value={booked} tone="violet" />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: number;
  tone?: "slate" | "emerald" | "violet";
}) {
  const tones = {
    slate: "text-slate-100",
    emerald: "text-emerald-300",
    violet: "text-violet-200",
  };
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-2 text-center">
      <p className={`text-lg font-bold tabular-nums leading-none ${tones[tone]}`}>
        {value}
      </p>
      <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
    </div>
  );
}
