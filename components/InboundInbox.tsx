"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  Check,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  ShieldQuestion,
  X,
} from "lucide-react";
import type {
  Endorsement,
  Graph,
  InboundDisposition,
  InboundRequestView,
  Persona,
} from "@/lib/types";
import { INBOUND_SEED } from "@/data/seed/inbound";
import { initials } from "./ui/cn";

/**
 * The RECIPIENT side: people reaching YOU on a warm path. You respond with a
 * disposition — Accept / Decline / Not now — plus an optional real message. The
 * vouch shows up here as decision-support (its most important job). Accepting is
 * the double-opt-in gate and hands off to booking. Client state, no backend.
 */
export function InboundInbox({
  graph,
  onSelect,
  onChange,
}: {
  graph: Graph | null;
  onSelect?: (req: InboundRequestView) => void;
  onChange?: (id: string, disposition: InboundDisposition, booked: boolean) => void;
}) {
  const views: InboundRequestView[] = useMemo(
    () => (graph ? resolveInbound(graph.personas) : []),
    [graph]
  );

  if (!graph) {
    return (
      <div className="flex items-center justify-center py-10 text-slate-500">
        <Loader2 size={18} className="mr-2 animate-spin" /> Loading requests…
      </div>
    );
  }

  if (views.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.02] px-6 py-10 text-center text-xs text-slate-400">
        No one&apos;s asked to reach you right now.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {views.map((v) => (
        <InboundItem key={v.id} req={v} onSelect={onSelect} onChange={onChange} />
      ))}
    </div>
  );
}

function InboundItem({
  req,
  onSelect,
  onChange,
}: {
  req: InboundRequestView;
  onSelect?: (req: InboundRequestView) => void;
  onChange?: (id: string, disposition: InboundDisposition, booked: boolean) => void;
}) {
  const [state, setState] = useState<InboundDisposition>("open");
  const [note, setNote] = useState("");
  const [booked, setBooked] = useState(false);

  // tell the parent so it can keep the badge accurate + grow the network
  function resolve(disposition: InboundDisposition, isBooked = false) {
    setState(disposition);
    onChange?.(req.id, disposition, isBooked);
  }

  const first = req.requester.name.split(" ")[0];

  if (state === "accepted") {
    return (
      <div className="animate-rise rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
          <CheckCircle2 size={16} />
          You&apos;re connected with {first}
        </div>
        {note.trim() && (
          <p className="mt-1.5 text-[12.5px] italic leading-snug text-emerald-100/90">
            You: “{note.trim()}”
          </p>
        )}
        <p className="mt-1.5 text-xs text-slate-400">
          Take it to a real conversation — Warmline hands off, it doesn&apos;t live in
          your inbox.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {booked ? (
            <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-2.5 text-xs font-semibold text-emerald-200">
              <CalendarCheck size={15} />
              Call booked · Thu 2:00 PM — invite sent to you both
            </div>
          ) : (
            <button
              onClick={() => {
                setBooked(true);
                onChange?.(req.id, "accepted", true);
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-3.5 py-2.5 text-xs font-semibold text-white shadow-[0_0_16px_rgba(139,92,246,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(139,92,246,0.6)]"
            >
              <CalendarCheck size={15} />
              Book a call with {first}
            </button>
          )}
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-xs text-slate-300">
            <Mail size={14} className="text-slate-400" />
            <span className="tabular-nums">{mockEmail(req.requester.name)}</span>
          </div>
        </div>
      </div>
    );
  }

  if (state === "declined") {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-300">
          <X size={14} />
          Declined · {first}
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {note.trim()
            ? `You let them know: “${note.trim()}”`
            : `${first} gets a polite no — no thread, no awkwardness.`}
        </p>
      </div>
    );
  }

  if (state === "snoozed") {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-[13px] text-slate-400">
        <span className="inline-flex items-center gap-2 font-medium">
          <Clock size={14} /> Snoozed — we&apos;ll resurface {first}&apos;s request later.
        </span>
      </div>
    );
  }

  // open — the respond UI (clicking the card lights its path on the graph)
  return (
    <div
      onClick={() => onSelect?.(req)}
      className="cursor-pointer rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 backdrop-blur-xl transition hover:border-violet-400/25"
    >
      {/* who's reaching you */}
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[11px] font-semibold text-white ring-1 ring-white/10"
          style={{ background: req.requester.avatarColor ?? "#6366f1" }}
        >
          {initials(req.requester.name)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-slate-100">
            {req.requester.name}
          </p>
          <p className="truncate text-[11px] text-slate-400">{req.requester.headline}</p>
        </div>
      </div>

      {/* warm path: requester → mutual → You */}
      {req.mutual && (
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="truncate">{req.requester.name.split(" ")[0]}</span>
          <ArrowRight size={11} className="shrink-0 text-slate-600" />
          <span className="truncate text-slate-300">{req.mutual.name.split(" ")[0]}</span>
          <ArrowRight size={11} className="shrink-0 text-slate-600" />
          <span className="font-semibold text-violet-200">You</span>
        </div>
      )}

      {/* the vouch as decision-support — or its honest absence */}
      <VouchSignal endorsement={req.endorsement} mutual={req.mutual?.name.split(" ")[0]} />

      {/* their ask + note */}
      <p className="mt-3 text-[12.5px] leading-snug text-slate-100">
        <span className="text-slate-500">Wants </span>
        {req.ask}
      </p>
      <p className="mt-1.5 text-[12px] italic leading-snug text-slate-300">
        “{req.message}”
      </p>

      {/* your message — real words, one shot, not a thread */}
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder={`Add a message to ${first} (optional) — say anything; it rides with your reply.`}
        className="mt-3 w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[12px] text-slate-200 placeholder:text-slate-500 outline-none focus:border-violet-400/40"
      />

      {/* disposition */}
      <div className="mt-2.5 flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            resolve("accepted");
          }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-3.5 py-2 text-xs font-semibold text-white shadow-[0_0_16px_rgba(139,92,246,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(139,92,246,0.6)]"
        >
          <Check size={14} />
          Accept
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            resolve("declined");
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-rose-400/30 hover:text-rose-200"
        >
          <X size={14} />
          Decline
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            resolve("snoozed");
          }}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-400 transition hover:text-slate-200"
        >
          <Clock size={13} />
          Not now
        </button>
      </div>
    </div>
  );
}

function VouchSignal({
  endorsement,
  mutual,
}: {
  endorsement?: Endorsement;
  mutual?: string;
}) {
  if (endorsement) {
    return (
      <div className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] p-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
          <BadgeCheck size={14} />
          {mutual} vouched
          <span className="ml-auto rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] tabular-nums text-emerald-200 ring-1 ring-emerald-400/25">
            {endorsement.score}/10
          </span>
        </div>
        {endorsement.note && (
          <p className="mt-1 text-[12px] italic leading-snug text-slate-300">
            “{endorsement.note}”
          </p>
        )}
      </div>
    );
  }
  return (
    <div className="mt-3 flex items-start gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 text-[11px] text-slate-400">
      <ShieldQuestion size={14} className="mt-0.5 shrink-0 text-slate-500" />
      <span>
        No vouch yet{mutual ? ` — ${mutual} was pinged` : ""}. A vouch would boost this;
        its absence doesn&apos;t block it — your call.
      </span>
    </div>
  );
}

/** Resolve the raw seed against the loaded personas (shared with page.tsx). */
export function resolveInbound(personas: Persona[]): InboundRequestView[] {
  const byId = new Map(personas.map((p) => [p.id, p]));
  return INBOUND_SEED.flatMap((s) => {
    const requester = byId.get(s.requesterId);
    if (!requester) return [];
    const mutual = s.mutualId ? byId.get(s.mutualId) : undefined;
    const endorsement: Endorsement | undefined =
      s.endorsement && s.mutualId
        ? { byId: s.mutualId, score: s.endorsement.score, note: s.endorsement.note }
        : undefined;
    return [
      { id: s.id, requester, mutual, endorsement, ask: s.ask, message: s.message },
    ];
  });
}

/** Plausible demo email from a name (diacritics stripped). */
function mockEmail(name: string): string {
  const parts = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .trim()
    .split(/\s+/);
  const first = parts[0] ?? "hello";
  const last = parts[parts.length - 1] ?? "";
  return `${first}${last ? "." + last : ""}@gmail.com`;
}
