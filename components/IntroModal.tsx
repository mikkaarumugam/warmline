"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  Sparkles,
  FileText,
  Send,
  CheckCircle2,
  CalendarCheck,
  Mail,
  Phone,
  BadgeCheck,
  Bell,
  ChevronRight,
} from "lucide-react";
import type { IntroResponse, MatchResult } from "@/lib/types";
import { acceptNote } from "@/lib/responses";
import { Modal } from "./ui/Modal";
import { initials } from "./ui/cn";

interface IntroModalProps {
  open: boolean;
  onClose: () => void;
  match: MatchResult | null;
  loading: boolean;
  intro: IntroResponse | null;
  /** Stage to open at — "draft" for a fresh intro, later stages when resuming a
   *  sent request from the Sent tab (e.g. "connected" jumps straight to booking). */
  initialStage?: Stage;
  /** Whether the call was already booked (when resuming a booked request). */
  initialBooked?: boolean;
  /** Fired when the user sends the request — records it in the "Sent requests" tab. */
  onSent?: (match: MatchResult, intro: IntroResponse) => void;
  /** Fired when the flow reaches "connected" — flips that sent request's status. */
  onConnected?: (personaId: string) => void;
  /** Fired when the call is booked — marks the sent request booked. */
  onBooked?: (personaId: string) => void;
}

/** Shows the drafted intro, then the request → accepted → connected handoff. */
export function IntroModal({
  open,
  onClose,
  match,
  loading,
  intro,
  initialStage,
  initialBooked,
  onSent,
  onConnected,
  onBooked,
}: IntroModalProps) {
  if (!match) return null;
  return (
    <Modal open={open} onClose={onClose} className="max-w-lg">
      {/* keyed so transient state resets each time a new intro opens */}
      <IntroBody
        key={`${match.persona.id}:${intro?.message ?? "loading"}:${initialStage ?? "draft"}`}
        match={match}
        loading={loading}
        intro={intro}
        initialStage={initialStage}
        initialBooked={initialBooked}
        onSent={onSent}
        onConnected={onConnected}
        onBooked={onBooked}
        onClose={onClose}
      />
    </Modal>
  );
}

export type Stage = "draft" | "sent" | "vouched" | "connected";

function IntroBody({
  match,
  loading,
  intro,
  initialStage,
  initialBooked,
  onSent,
  onConnected,
  onBooked,
  onClose,
}: {
  match: MatchResult;
  loading: boolean;
  intro: IntroResponse | null;
  initialStage?: Stage;
  initialBooked?: boolean;
  onSent?: (match: MatchResult, intro: IntroResponse) => void;
  onConnected?: (personaId: string) => void;
  onBooked?: (personaId: string) => void;
  onClose?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [stage, setStage] = useState<Stage>(initialStage ?? "draft");
  const [booked, setBooked] = useState(initialBooked ?? false);

  const mutual = match.mutual;
  const target = match.persona;
  const targetFirst = target.name.split(" ")[0];
  const mutualFirst = mutual?.name.split(" ")[0];

  async function copy() {
    if (!intro) return;
    await navigator.clipboard.writeText(intro.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // The causal chain is real-world async: you request → the mutual vouches (whenever
  // they get to it) → the target accepts. We don't fake it with timers — each later
  // event arrives as a notification you open, so the wait stays honest and the demo
  // stays in the presenter's hands.
  const hasVouch = Boolean(match.endorsement && mutual);

  function send() {
    setStage("sent");
    if (intro) onSent?.(match, intro);
  }

  // Reaching "connected" = the target accepted → reflect it in the Sent tab.
  function connect() {
    setStage("connected");
    onConnected?.(target.id);
  }

  function book() {
    setBooked(true);
    // Hold the "Call booked" beat, then step the modal aside and *only then* form
    // the connection — so the network reveal (the node growing into your ring)
    // plays on an unobstructed graph rather than hidden behind this popup.
    setTimeout(() => {
      onBooked?.(target.id);
      onClose?.();
    }, 1500);
  }

  return (
    <div className="p-7">
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-semibold text-white shadow-[0_0_16px_rgba(0,0,0,0.5)] ring-1 ring-white/10"
          style={{ background: target.avatarColor ?? "#6366f1" }}
        >
          {initials(target.name)}
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-100">
            Request intro to {target.name}
          </h2>
          <p className="text-xs text-slate-400">
            {mutual
              ? `Your note — ${mutual.name.split(" ")[0]} can forward it and vouch`
              : `A direct note to ${target.name}`}
          </p>
        </div>
      </div>

      <div className="mt-5">
        {loading || !intro ? (
          <DraftSkeleton />
        ) : (
          <>
            <div className="relative rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
              <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-slate-200">
                {intro.message}
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
                {intro.generatedBy === "claude" ? (
                  <>
                    <Sparkles size={13} className="text-violet-300" />
                    Written by Claude
                  </>
                ) : (
                  <>
                    <FileText size={13} className="text-slate-500" />
                    Template draft
                  </>
                )}
              </span>

              {stage === "draft" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={copy}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-indigo-400/40 hover:text-indigo-200"
                  >
                    {copied ? (
                      <>
                        <Check size={14} className="text-emerald-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        Copy
                      </>
                    )}
                  </button>
                  <button
                    onClick={send}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-3.5 py-2 text-xs font-semibold text-white shadow-[0_0_16px_rgba(139,92,246,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(139,92,246,0.6)]"
                  >
                    <Send size={13} />
                    Send request
                  </button>
                </div>
              )}
            </div>

            {/* ── request sent: honestly pending, the next event arrives as a
                 notification you open (no fake timers, presenter-paced) ── */}
            {stage === "sent" && (
              <>
                <PendingStatus
                  title={`Request sent · ${targetFirst} was notified`}
                  detail={
                    hasVouch
                      ? `Pinging ${mutualFirst} for a vouch too. People usually reply within a day — we’ll let you know here.`
                      : `People usually reply within a day — we’ll let you know here.`
                  }
                />
                {hasVouch ? (
                  <NotificationCard
                    title={`${mutualFirst} vouched for you`}
                    onOpen={() => setStage("vouched")}
                  />
                ) : (
                  <NotificationCard
                    title={`${targetFirst} accepted your request`}
                    onOpen={connect}
                  />
                )}
              </>
            )}

            {/* ── the mutual's vouch — appears only AFTER you've requested ── */}
            {(stage === "vouched" || stage === "connected") &&
              match.endorsement &&
              mutual && (
                <div className="animate-rise mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] p-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                    <BadgeCheck size={14} />
                    {mutualFirst} vouched for you
                    <span className="ml-auto rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] tabular-nums text-emerald-200 ring-1 ring-emerald-400/25">
                      {match.endorsement.score}/10
                    </span>
                  </div>
                  {match.endorsement.note && (
                    <p className="mt-1 text-[12px] italic leading-snug text-slate-300">
                      “{match.endorsement.note}”
                    </p>
                  )}
                </div>
              )}

            {/* ── vouch attached, now waiting on the target to accept ── */}
            {stage === "vouched" && (
              <>
                <PendingStatus
                  title={`Vouch attached · waiting on ${targetFirst}`}
                  detail={`Your request and ${mutualFirst}’s vouch are with ${targetFirst}. We’ll let you know here when they respond.`}
                />
                <NotificationCard
                  title={`${targetFirst} accepted your request`}
                  onOpen={connect}
                />
              </>
            )}

            {/* ── connected: handoff to a real conversation ── */}
            {stage === "connected" && (
              <ConnectedHandoff
                target={target}
                booked={booked}
                onBook={book}
                note={acceptNote(target)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ConnectedHandoff({
  target,
  booked,
  onBook,
  note,
}: {
  target: MatchResult["persona"];
  booked: boolean;
  onBook: () => void;
  note?: string;
}) {
  const first = target.name.split(" ")[0];
  const email = mockEmail(target.name);

  return (
    <div className="animate-rise mt-4 rounded-xl border border-emerald-400/25 bg-emerald-400/[0.06] p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
        <CheckCircle2 size={16} />
        {first} accepted your intro
      </div>
      {note && (
        <p className="mt-1.5 text-[12.5px] italic leading-snug text-emerald-100/90">
          “{note}”
        </p>
      )}
      <p className="mt-1.5 text-xs text-slate-400">
        You&apos;re connected. Take it to a real conversation — Warmline hands off, it
        doesn&apos;t live in your inbox.
      </p>

      <div className="mt-3.5 flex flex-col gap-2">
        {booked ? (
          <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-2.5 text-xs font-semibold text-emerald-200">
            <CalendarCheck size={15} />
            Call booked · Thu 2:00 PM — calendar invite sent to you both
          </div>
        ) : (
          <button
            onClick={onBook}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-3.5 py-2.5 text-xs font-semibold text-white shadow-[0_0_16px_rgba(139,92,246,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(139,92,246,0.6)]"
          >
            <CalendarCheck size={15} />
            Book a call with {first}
          </button>
        )}

        <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-xs text-slate-300">
          <Mail size={14} className="text-slate-400" />
          <span className="tabular-nums">{email}</span>
        </div>

        <p className="flex items-center gap-1.5 px-0.5 text-[11px] text-slate-500">
          <Phone size={11} />
          {first} shares a number after your first call — opt-in, never by default.
        </p>
      </div>
    </div>
  );
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

/** Calm, honest "we're waiting" state — no spinner (this can take hours, not seconds). */
function PendingStatus({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="animate-rise mt-4 flex items-start gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
      <span className="relative mt-1 flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400/60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-400" />
      </span>
      <div>
        <p className="text-sm text-slate-300">{title}</p>
        <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{detail}</p>
      </div>
    </div>
  );
}

/** An incoming notification you tap to open — how the real async events would arrive. */
function NotificationCard({ title, onOpen }: { title: string; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="animate-rise group mt-2.5 flex w-full items-center gap-3 rounded-xl border border-violet-400/25 bg-violet-400/[0.06] px-4 py-3 text-left transition hover:border-violet-400/45 hover:bg-violet-400/[0.1]"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-400/15 text-violet-200 ring-1 ring-violet-400/25">
        <Bell size={15} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-violet-300/80">
          New notification
        </p>
        <p className="truncate text-sm font-medium text-slate-100">{title}</p>
      </div>
      <ChevronRight
        size={16}
        className="shrink-0 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-violet-200"
      />
    </button>
  );
}

function DraftSkeleton() {
  return (
    <div className="space-y-2.5">
      <div className="skeleton h-3.5 w-[92%] rounded" />
      <div className="skeleton h-3.5 w-full rounded" />
      <div className="skeleton h-3.5 w-[85%] rounded" />
      <div className="skeleton h-3.5 w-[70%] rounded" />
      <div className="mt-4 flex items-center gap-2 text-xs font-medium text-violet-300">
        <Sparkles size={13} className="animate-pulse" />
        Drafting the intro…
      </div>
    </div>
  );
}
