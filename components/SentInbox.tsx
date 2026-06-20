"use client";

import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  Send,
  XCircle,
} from "lucide-react";
import type { SentRequest } from "@/lib/types";
import { acceptNote } from "@/lib/responses";
import { ConnectStats } from "./ConnectStats";
import { initials } from "./ui/cn";

/**
 * The ASKER side, outbound: the intro requests YOU'VE sent and where each one
 * stands (pending → connected → booked, or declined). Mirror of VouchInbox.
 * Each card resumes the flow — tap a connected one to jump straight to booking —
 * and shows the recipient's one-line reply (their disposition, not a chat).
 * Client state, no backend.
 */
export function SentInbox({
  requests,
  onOpen,
}: {
  requests: SentRequest[];
  onOpen: (req: SentRequest) => void;
}) {
  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.02] px-6 py-12 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-400/10 text-indigo-300 ring-1 ring-indigo-400/20">
          <Send size={18} />
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-200">Nothing sent yet</p>
        <p className="mt-1 max-w-xs text-xs text-slate-400">
          Intros you request show up here — come back to see who vouched, who
          accepted, and to book the call.
        </p>
      </div>
    );
  }

  const sorted = [...requests].sort((a, b) => b.sentAt - a.sentAt);
  const pending = sorted.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-3">
      <ConnectStats requests={requests} />

      {/* purpose framing — what this tab is and what it's for */}
      <div>
        <p className="text-sm font-semibold text-slate-200">
          Intros you&apos;ve requested
        </p>
        <p className="mt-0.5 text-xs leading-snug text-slate-400">
          Sent to people who opted in — we ping you when a mutual vouches or someone
          accepts. Tap one to pick it back up.
          {pending > 0 && (
            <span className="text-slate-500">
              {" "}
              {pending} waiting on a reply.
            </span>
          )}
        </p>
      </div>

      {sorted.map((r) => (
        <SentItem key={r.id} req={r} onOpen={() => onOpen(r)} />
      ))}
    </div>
  );
}

function SentItem({ req, onOpen }: { req: SentRequest; onOpen: () => void }) {
  const target = req.match.persona;
  const mutual = req.match.mutual;
  const targetFirst = target.name.split(" ")[0];
  const declined = req.status === "declined";
  // their reply: a generated accept note, or the seeded decline reason
  const reply =
    req.status === "connected" ? acceptNote(target) : declined ? req.responseNote : undefined;

  const body = (
    <>
      {/* warm path: You → (mutual) → target */}
      <div className="flex items-center gap-2 text-[13px] font-medium text-slate-200">
        <Avatar name="You" />
        <ArrowRight size={12} className="shrink-0 text-slate-600" />
        {mutual && (
          <>
            <Avatar name={mutual.name} />
            <span className="truncate text-slate-400">
              {mutual.name.split(" ")[0]}
            </span>
            <ArrowRight size={12} className="shrink-0 text-slate-600" />
          </>
        )}
        <Avatar name={target.name} />
        <span className="truncate font-semibold text-violet-200">{targetFirst}</span>
        <StatusBadge req={req} />
      </div>

      {/* lead with the ASK — the context you'd otherwise forget */}
      {req.ask && (
        <p className="mt-2.5 text-[12.5px] leading-snug text-slate-100">
          <span className="text-slate-500">Looking for </span>
          {req.ask}
        </p>
      )}

      {/* their reply once they've responded, else a preview of your note */}
      {reply ? (
        <p
          className={`mt-1.5 text-[11.5px] leading-snug ${
            declined ? "text-slate-400" : "text-emerald-200/90"
          }`}
        >
          <span className="font-medium">{targetFirst}:</span>{" "}
          <span className="italic">“{reply}”</span>
        </p>
      ) : (
        <p className="mt-1 line-clamp-1 text-[11px] italic text-slate-500">
          “{req.intro.message}”
        </p>
      )}

      <div className="mt-2.5 flex items-center justify-between text-[11px]">
        <span className="text-slate-500">{relativeTime(req.sentAt)}</span>
        {declined ? (
          <span className="font-medium text-slate-500">Closed · they passed</span>
        ) : (
          <span className="inline-flex items-center gap-1 font-medium text-violet-300/90 transition group-hover:text-violet-200">
            {nextStep(req, mutual?.name.split(" ")[0])}
            <ChevronRight
              size={13}
              className="transition group-hover:translate-x-0.5"
            />
          </span>
        )}
      </div>
    </>
  );

  // declined = terminal, no resume; everything else reopens the flow
  if (declined) {
    return (
      <div className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
        {body}
      </div>
    );
  }

  return (
    <button
      onClick={onOpen}
      className="group w-full rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 text-left backdrop-blur-xl transition hover:border-violet-400/30 hover:bg-white/[0.05]"
    >
      {body}
    </button>
  );
}

/** The action-oriented "what's next" line (not a duplicate of the status badge). */
function nextStep(req: SentRequest, mutualFirst?: string): string {
  if (req.booked) return "View booking";
  if (req.status === "connected") return "Book a call";
  return mutualFirst ? `${mutualFirst} can vouch` : "Awaiting their reply";
}

function StatusBadge({ req }: { req: SentRequest }) {
  if (req.booked) {
    return (
      <Badge tone="emerald" icon={<CalendarCheck size={11} />}>
        Booked
      </Badge>
    );
  }
  if (req.status === "connected") {
    return (
      <Badge tone="emerald" icon={<CheckCircle2 size={11} />}>
        Connected
      </Badge>
    );
  }
  if (req.status === "declined") {
    return (
      <Badge tone="slate" icon={<XCircle size={11} />}>
        Declined
      </Badge>
    );
  }
  return (
    <Badge tone="amber" icon={<Clock size={11} />}>
      Pending
    </Badge>
  );
}

function Badge({
  tone,
  icon,
  children,
}: {
  tone: "emerald" | "amber" | "slate";
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const tones = {
    emerald: "bg-emerald-400/15 text-emerald-200 ring-emerald-400/25",
    amber: "bg-amber-400/15 text-amber-200 ring-amber-400/25",
    slate: "bg-slate-400/10 text-slate-300 ring-slate-400/20",
  };
  return (
    <span
      className={`ml-auto inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${tones[tone]}`}
    >
      {icon}
      {children}
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/[0.08] text-[9px] font-semibold text-slate-200 ring-1 ring-white/10">
      {initials(name)}
    </div>
  );
}

/** Compact "3h ago" / "2d ago" relative time. */
function relativeTime(epochMs: number): string {
  const mins = Math.max(0, Math.round((Date.now() - epochMs) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}
