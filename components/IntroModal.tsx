"use client";

import { useState } from "react";
import { Check, Copy, Sparkles, FileText, Send } from "lucide-react";
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

/** Shows the drafted intro, written in the mutual's voice, with a copy button. */
export function IntroModal({ open, onClose, match, loading, intro }: IntroModalProps) {
  if (!match) return null;
  return (
    <Modal open={open} onClose={onClose} className="max-w-lg">
      {/* keyed so transient "Copied" state resets each time a new intro opens */}
      <IntroBody key={`${match.persona.id}:${intro?.message ?? "loading"}`} match={match} loading={loading} intro={intro} />
    </Modal>
  );
}

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

  const mutual = match.mutual;
  const target = match.persona;

  async function copy() {
    if (!intro) return;
    await navigator.clipboard.writeText(intro.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-7">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-semibold text-white shadow"
            style={{ background: mutual?.avatarColor ?? target.avatarColor ?? "#6366f1" }}
          >
            {initials(mutual?.name ?? target.name)}
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Draft intro {mutual ? `from ${mutual.name}` : `to ${target.name}`}
            </h2>
            <p className="text-xs text-slate-500">
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
              <div className="relative rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-slate-700">
                  {intro.message}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  {intro.generatedBy === "claude" ? (
                    <>
                      <Sparkles size={13} className="text-violet-500" />
                      Written by Claude
                    </>
                  ) : (
                    <>
                      <FileText size={13} className="text-slate-400" />
                      Template draft
                    </>
                  )}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={copy}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600"
                  >
                    {copied ? (
                      <>
                        <Check size={14} className="text-emerald-500" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        Copy
                      </>
                    )}
                  </button>
                  <button className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 py-2 text-xs font-semibold text-white shadow shadow-indigo-600/25 transition hover:-translate-y-0.5">
                    <Send size={13} />
                    Send request
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
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
      <div className="mt-4 flex items-center gap-2 text-xs font-medium text-violet-500">
        <Sparkles size={13} className="animate-pulse" />
        Drafting the intro…
      </div>
    </div>
  );
}
