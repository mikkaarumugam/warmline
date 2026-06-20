"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Network, Search, Sparkles } from "lucide-react";
import type {
  Graph,
  IntroResponse,
  MatchResponse,
  MatchResult,
  Persona,
} from "@/lib/types";
import { cn } from "@/components/ui/cn";
import { Onboarding } from "@/components/Onboarding";
import { AskBar } from "@/components/AskBar";
import { YouCard } from "@/components/YouCard";
import { ResultsPanel } from "@/components/ResultsPanel";
import { VouchInbox } from "@/components/VouchInbox";
import { IntroModal } from "@/components/IntroModal";
import { NetworkGraph } from "@/components/graph/NetworkGraph";

type Tab = "matches" | "inbox";

const PREFILLED_ASK = "A technical cofounder who knows payments infrastructure";

export default function Home() {
  const [entered, setEntered] = useState(false);

  if (!entered) return <Onboarding onEnter={() => setEntered(true)} />;
  return <App />;
}

function App() {
  const [graph, setGraph] = useState<Graph | null>(null);
  const [me, setMe] = useState<Persona | null>(null);

  const [ask, setAsk] = useState(PREFILLED_ASK);
  const [matching, setMatching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [selected, setSelected] = useState<MatchResult | null>(null);

  const [introOpen, setIntroOpen] = useState(false);
  const [introLoading, setIntroLoading] = useState(false);
  const [intro, setIntro] = useState<IntroResponse | null>(null);
  const [introMatch, setIntroMatch] = useState<MatchResult | null>(null);

  const [tab, setTab] = useState<Tab>("matches");
  const [vouchCount, setVouchCount] = useState(0);

  // load the network graph for the viz
  useEffect(() => {
    fetch("/api/personas")
      .then((r) => r.json())
      .then((g: Graph) => {
        setGraph(g);
        setMe(g.personas.find((p) => p.id === g.me) ?? null);
      })
      .catch(() => {});
    fetch("/api/vouch-requests")
      .then((r) => r.json())
      .then((d) => setVouchCount(d.requests?.length ?? 0))
      .catch(() => {});
  }, []);

  const runMatch = useCallback(async () => {
    if (!ask.trim()) return;
    setMatching(true);
    setSelected(null);
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ask }),
      });
      const data: MatchResponse = await res.json();
      const next = data.results ?? [];
      setResults(next);
      setSearched(true);
      // auto-select the top match so the graph lights up immediately
      setSelected(next[0] ?? null);
    } finally {
      setMatching(false);
    }
  }, [ask]);

  const draftIntro = useCallback(
    async (r: MatchResult) => {
      setIntroMatch(r);
      setIntro(null);
      setIntroLoading(true);
      setIntroOpen(true);
      try {
        const res = await fetch("/api/intro", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            matchPersonaId: r.persona.id,
            mutualId: r.mutual?.id,
            ask,
          }),
        });
        const data: IntroResponse = await res.json();
        setIntro(data);
      } finally {
        setIntroLoading(false);
      }
    },
    [ask]
  );

  return (
    <div className="app-aurora flex h-dvh flex-col">
      <Header />

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[400px_1fr]">
        {/* ── Left: ask + you + results ──────────────────────────────── */}
        <aside className="thin-scroll flex min-h-0 flex-col gap-4 overflow-y-auto border-r border-white/[0.07] bg-[#0c0d18]/70 p-5 backdrop-blur-xl">
          <TabSwitcher tab={tab} setTab={setTab} vouchCount={vouchCount} />

          {tab === "matches" ? (
            <>
              <AskBar
                value={ask}
                onChange={setAsk}
                onSubmit={runMatch}
                loading={matching}
              />
              {me && <YouCard me={me} />}
              {graph && (
                <ResultsPanel
                  graph={graph}
                  results={results}
                  loading={matching}
                  searched={searched}
                  selectedId={selected?.persona.id ?? null}
                  onSelect={setSelected}
                  onDraft={draftIntro}
                />
              )}
            </>
          ) : (
            <VouchInbox />
          )}
        </aside>

        {/* ── Right: the network graph (money shot) ──────────────────── */}
        <section className="relative min-h-0 bg-[#070710]">
          {/* faint radial glow centered on the ego node */}
          <div className="pointer-events-none absolute inset-0 [background:radial-gradient(620px_460px_at_50%_46%,rgba(99,102,241,0.14),transparent_70%)]" />
          {graph ? (
            <NetworkGraph graph={graph} selected={selected} />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500">
              <Loader2 size={20} className="mr-2 animate-spin" />
              Mapping your network…
            </div>
          )}

          <GraphLegend selected={selected} />
        </section>
      </div>

      <IntroModal
        open={introOpen}
        onClose={() => setIntroOpen(false)}
        match={introMatch}
        loading={introLoading}
        intro={intro}
      />
    </div>
  );
}

function TabSwitcher({
  tab,
  setTab,
  vouchCount,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  vouchCount: number;
}) {
  return (
    <div className="flex gap-1 rounded-xl border border-white/[0.07] bg-white/[0.03] p-1">
      <TabButton active={tab === "matches"} onClick={() => setTab("matches")}>
        <Search size={13} />
        Matches
      </TabButton>
      <TabButton active={tab === "inbox"} onClick={() => setTab("inbox")}>
        <Sparkles size={13} />
        Vouch requests
        {vouchCount > 0 && (
          <span
            className={cn(
              "ml-1 rounded-full px-1.5 text-[10px] font-bold tabular-nums",
              tab === "inbox"
                ? "bg-white/20 text-white"
                : "bg-violet-500/25 text-violet-200"
            )}
          >
            {vouchCount}
          </span>
        )}
      </TabButton>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition",
        active
          ? "bg-gradient-to-r from-indigo-500/90 to-violet-500/90 text-white shadow-[0_0_16px_rgba(139,92,246,0.35)]"
          : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
      )}
    >
      {children}
    </button>
  );
}

function Header() {
  return (
    <header className="relative z-10 flex shrink-0 items-center justify-between border-b border-white/[0.07] bg-[#0b0b14]/70 px-5 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-[0_0_18px_rgba(139,92,246,0.55)]">
          <Network size={17} />
        </div>
        <div>
          <p className="bg-gradient-to-r from-slate-50 via-indigo-100 to-violet-200 bg-clip-text text-sm font-semibold tracking-tight text-transparent">
            Warmline
          </p>
          <p className="text-[11px] leading-none text-slate-500">
            Two-sided · declared · warm
          </p>
        </div>
      </div>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-medium text-indigo-200">
        <Sparkles size={12} />
        Demo network
      </span>
    </header>
  );
}

function GraphLegend({ selected }: { selected: MatchResult | null }) {
  return (
    <div className="pointer-events-none absolute bottom-4 left-4 rounded-xl border border-white/[0.08] bg-[#0d0e1a]/80 px-3.5 py-2.5 text-[11px] shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
      {selected ? (
        <div className="flex items-center gap-2 font-medium text-slate-200">
          <span className="inline-block h-1 w-6 rounded-full bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 shadow-[0_0_8px_rgba(167,139,250,0.7)]" />
          Warm path to {selected.persona.name.split(" ")[0]}
        </div>
      ) : (
        <div className="flex items-center gap-2 font-medium text-slate-400">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-600" />
          Select a match to trace the warm path
        </div>
      )}
    </div>
  );
}
