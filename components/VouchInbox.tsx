"use client";

import { useEffect, useState } from "react";
import { ArrowRight, BadgeCheck, Inbox, Loader2 } from "lucide-react";
import type { VouchRequestView } from "@/lib/types";
import { cn, initials } from "./ui/cn";

/**
 * The VOUCHER side of the product: people in your network asking YOU to back
 * them to someone you also know. You add a 1–10 confidence + a note — signal,
 * not a gate. Faked send (client state) — no backend needed for the demo.
 */
export function VouchInbox() {
  const [requests, setRequests] = useState<VouchRequestView[] | null>(null);

  useEffect(() => {
    fetch("/api/vouch-requests")
      .then((r) => r.json())
      .then((d) => setRequests(d.requests ?? []))
      .catch(() => setRequests([]));
  }, []);

  if (!requests) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-500">
        <Loader2 size={18} className="mr-2 animate-spin" /> Loading requests…
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.02] px-6 py-12 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-400/10 text-indigo-300 ring-1 ring-indigo-400/20">
          <Inbox size={20} />
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-200">All caught up</p>
        <p className="mt-1 max-w-xs text-xs text-slate-400">
          No one&apos;s asked for your vouch right now.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-slate-500">
        {requests.length} {requests.length === 1 ? "person wants" : "people want"} your
        vouch · you&apos;re their mutual
      </p>
      {requests.map((vr) => (
        <VouchItem key={vr.id} req={vr} />
      ))}
    </div>
  );
}

function VouchItem({ req }: { req: VouchRequestView }) {
  const [score, setScore] = useState(7);
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
          <BadgeCheck size={16} />
          Vouch sent to {req.requester.name.split(" ")[0]} · {score}/10
        </div>
        <p className="mt-1 text-xs text-slate-400">
          {req.requester.name.split(" ")[0]}&apos;s intro to {req.target.name.split(" ")[0]} now
          carries your confidence.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 backdrop-blur-xl">
      {/* who → whom */}
      <div className="flex items-center gap-2 text-[13px] font-medium text-slate-200">
        <Avatar name={req.requester.name} />
        <span className="truncate">{req.requester.name.split(" ")[0]}</span>
        <ArrowRight size={12} className="shrink-0 text-slate-600" />
        <span className="text-slate-400">wants to reach</span>
        <span className="truncate font-semibold text-violet-200">
          {req.target.name.split(" ")[0]}
        </span>
      </div>

      <p className="mt-2 text-[12px] italic leading-snug text-slate-300">
        “{req.context}”
      </p>

      {/* confidence slider */}
      <div className="mt-3.5">
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
          <span>How strongly do you back this?</span>
          <span className="rounded-full bg-violet-400/15 px-2 py-0.5 font-semibold tabular-nums text-violet-200 ring-1 ring-violet-400/25">
            {score}/10
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          className="mt-2 w-full accent-violet-500"
        />
      </div>

      {/* note */}
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="Add a note (optional) — what makes you back them?"
        className="mt-3 w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[12px] text-slate-200 placeholder:text-slate-500 outline-none focus:border-violet-400/40"
      />

      <button
        onClick={() => setSent(true)}
        className={cn(
          "mt-3 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-3.5 py-2 text-xs font-semibold text-white shadow-[0_0_16px_rgba(139,92,246,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(139,92,246,0.6)]"
        )}
      >
        <BadgeCheck size={13} />
        Send vouch
      </button>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/[0.08] text-[9px] font-semibold text-slate-200 ring-1 ring-white/10">
      {initials(name)}
    </div>
  );
}
