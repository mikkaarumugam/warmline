"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, Network, Handshake } from "lucide-react";
import { Modal } from "./ui/Modal";
import { LinkedInIcon } from "./ui/LinkedInIcon";

interface OnboardingProps {
  /** Enter the live demo app. */
  onEnter: () => void;
}

/**
 * Entry / empty-state. The "Import from LinkedIn" button is EDGES-ONLY framing:
 * it would seed who-knows-who. Offers and asks are always DECLARED by both sides —
 * that's the wedge vs one-sided LinkedIn scraping. The button opens a roadmap
 * modal whose primary CTA drops into the pre-seeded demo network.
 */
export function Onboarding({ onEnter }: OnboardingProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6">
      {/* ambient gradient field */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-200/50 via-violet-200/40 to-transparent blur-3xl" />
        <div className="absolute bottom-[-15%] left-[10%] h-[380px] w-[380px] rounded-full bg-fuchsia-200/30 blur-3xl" />
        <div className="absolute right-[8%] top-[20%] h-[320px] w-[320px] rounded-full bg-sky-200/30 blur-3xl" />
      </div>

      <div className="w-full max-w-xl animate-rise text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-indigo-700 shadow-sm backdrop-blur">
          <Sparkles size={13} className="text-violet-500" />
          Two-sided, declared warm-intro marketplace
        </span>

        <h1 className="mt-6 bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-700 bg-clip-text text-5xl font-semibold leading-[1.05] tracking-tight text-transparent sm:text-6xl">
          Warm-Intro
          <br />
          Autopilot
        </h1>

        <p className="mx-auto mt-5 max-w-md text-balance text-[15px] leading-relaxed text-slate-600">
          Connect LinkedIn to map your network — then both sides declare their
          offer &amp; ask. Post an ask, match against declared offers across your
          network, and one-click draft the intro your mutual would send.
        </p>

        <div className="mt-9 flex flex-col items-center gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="group inline-flex items-center gap-2.5 rounded-xl bg-[#0a66c2] px-6 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-[#0a66c2]/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#0a66c2]/30 active:translate-y-0"
          >
            <LinkedInIcon size={19} />
            Import from LinkedIn
            <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide">
              Coming soon
            </span>
          </button>

          <button
            onClick={onEnter}
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
          >
            or explore the demo network
            <ArrowRight
              size={15}
              className="transition group-hover:translate-x-0.5"
            />
          </button>
        </div>

        {/* the two-sided wedge, made explicit */}
        <div className="mx-auto mt-12 grid max-w-lg grid-cols-2 gap-3 text-left">
          <Wedge
            icon={<Network size={16} />}
            title="LinkedIn seeds the edges"
            body="Who-knows-who only. We map the graph, not your résumé."
          />
          <Wedge
            icon={<Handshake size={16} />}
            title="Both sides declare"
            body="Offers & asks are stated, never scraped or inferred."
          />
        </div>
      </div>

      <LinkedInModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onEnter={onEnter}
      />
    </div>
  );
}

function Wedge({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white/60 p-4 backdrop-blur">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
        {icon}
      </div>
      <p className="mt-2.5 text-sm font-semibold text-slate-800">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">{body}</p>
    </div>
  );
}

function LinkedInModal({
  open,
  onClose,
  onEnter,
}: {
  open: boolean;
  onClose: () => void;
  onEnter: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-7">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0a66c2]/10 text-[#0a66c2]">
          <LinkedInIcon size={24} />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-slate-900">
          LinkedIn import is on our roadmap
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Today&apos;s demo uses a pre-seeded network. When live, the import only
          maps <span className="font-medium text-slate-800">who you know</span> —
          the warm edges. Offers and asks always stay{" "}
          <span className="font-medium text-slate-800">declared</span> by both
          sides.
        </p>

        <button
          onClick={() => {
            onClose();
            onEnter();
          }}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-600/30 active:translate-y-0"
        >
          <Sparkles size={16} />
          Explore the demo network
        </button>
        <button
          onClick={onClose}
          className="mt-2 w-full rounded-xl px-5 py-2 text-sm font-medium text-slate-400 transition hover:text-slate-600"
        >
          Maybe later
        </button>
      </div>
    </Modal>
  );
}
