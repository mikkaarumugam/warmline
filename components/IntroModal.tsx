"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  Sparkles,
  FileText,
  Send,
  Loader2,
  CheckCircle2,
  CalendarCheck,
  Mail,
  Phone,
  BadgeCheck,
} from "lucide-react";
import type { IntroResponse, MatchResult } from "@/lib/types";
import { Modal } from "./ui/Modal";
import { initials } from "./ui/cn";

interface IntroModalProps {
  open: boolean;
  onClose: () => void;
  match: MatchResult | null;
  loading: boolean;
  intro: IntroResponse | null;
}

/** Shows the drafted intro, then the request → accepted → connected handoff. */
export function IntroModal({ open, onClose, match, loading, intro }: IntroModalProps) {
  if (!match) return null;
  return (
    <Modal open={open} onClose={onClose} className="max-w-lg">
      {/* keyed so transient state resets each time a new intro opens */}
      <IntroBody
        key={`${match.persona.id}:${intro?.message ?? "loading"}`}
        match={match}
        loading={loading}
        intro={intro}
      />
    </Modal>
  );
}

type Stage = "draft" | "sent" | "vouched" | "connected";

function IntroBody({
  match,
  loading,
  intro,
}: {
  match: MatchResult;
  loading: boolean;
  intro: IntroResponse | null;
}) {
  const [copied, setCopied] = useState(false);
  const [stage, setStage] = useState<Stage>("draft");
  const [booked, setBooked] = useState(false);

  const mutual = match.mutual;
  const target = match.persona;

  async function copy() {
    if (!intro) return;
    await navigator.clipboard.writeText(intro.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function send() {
    setStage("sent");
    // Causal chain (faked for the demo): you request → the mutual is asked to
    // vouch → they vouch → the target accepts with the vouch attached.
    if (match.endorsement && mutual) {
      setTimeout(() => setStage("vouched"), 1200);
      setTimeout(() => setStage("connected"), 2800);
    } else {
      setTimeout(() => setStage("connected"), 1600);
    }
  }

  return (
    <div className="p-7">
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-semibold text-white shadow-[0_0_16px_rgba(0,0,0,0.5)] ring-1 ring-white/10"
          style={{ background: mutual?.avatarColor ?? target.avatarColor ?? "#6366f1" }}
        >
          {initials(mutual?.name ?? target.name)}
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-100">
            Draft intro {mutual ? `from ${mutual.name}` : `to ${target.name}`}
          </h2>
          <p className="text-xs text-slate-400">
            {mutual
              ? `Written in ${mutual.name.split(" ")[0]}'s voice — ready to send to ${target.name}`
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

            {/* ── request sent: the mutual is asked to vouch ── */}
            {stage === "sent" && (
              <PendingRow>
                {mutual && match.endorsement
                  ? `Request sent — asking ${mutual.name.split(" ")[0]} to vouch…`
                  : `Request sent — waiting for ${target.name.split(" ")[0]} to accept…`}
              </PendingRow>
            )}

            {/* ── the mutual's vouch — appears only AFTER you've requested ── */}
            {(stage === "vouched" || stage === "connected") &&
              match.endorsement &&
              mutual && (
                <div className="animate-rise mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] p-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                    <BadgeCheck size={14} />
                    {mutual.name.split(" ")[0]} vouched for this intro
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

            {/* ── vouch attached, now waiting for the target ── */}
            {stage === "vouched" && (
              <PendingRow>
                Vouch attached — waiting for {target.name.split(" ")[0]} to accept…
              </PendingRow>
            )}

            {/* ── connected: handoff to a real conversation ── */}
            {stage === "connected" && (
              <ConnectedHandoff target={target} booked={booked} onBook={() => setBooked(true)} />
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
}: {
  target: MatchResult["persona"];
  booked: boolean;
  onBook: () => void;
}) {
  const first = target.name.split(" ")[0];
  const email = mockEmail(target.name);

  return (
    <div className="animate-rise mt-4 rounded-xl border border-emerald-400/25 bg-emerald-400/[0.06] p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
        <CheckCircle2 size={16} />
        {first} accepted your intro
      </div>
      <p className="mt-1 text-xs text-slate-400">
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

function PendingRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
      <Loader2 size={16} className="animate-spin text-violet-300" />
      <span>{children}</span>
    </div>
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
