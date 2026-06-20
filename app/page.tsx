"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Network, Sparkles } from "lucide-react";
import type {
  Graph,
  IntroResponse,
  MatchResponse,
  MatchResult,
  Persona,
} from "@/lib/types";
import { Onboarding } from "@/components/Onboarding";
import { AskBar } from "@/components/AskBar";
import { YouCard } from "@/components/YouCard";
import { ResultsPanel } from "@/components/ResultsPanel";
import { IntroModal } from "@/components/IntroModal";
import { NetworkGraph } from "@/components/graph/NetworkGraph";

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

  // load the network graph for the viz
  useEffect(() => {
    fetch("/api/personas")
      .then((r) => r.json())
      .then((g: Graph) => {
        setGraph(g);
        setMe(g.personas.find((p) => p.id === g.me) ?? null);
      })
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
    <div className="flex h-dvh flex-col bg-[#fbfbfe]">
      <Header />

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[400px_1fr]">
        {/* ── Left: ask + you + results ──────────────────────────────── */}
        <aside className="thin-scroll flex min-h-0 flex-col gap-4 overflow-y-auto border-r border-slate-200 bg-white/40 p-5">
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
        </aside>

        {/* ── Right: the network graph (money shot) ──────────────────── */}
        <section className="relative min-h-0 bg-gradient-to-br from-slate-50 to-indigo-50/40">
          {graph ? (
            <NetworkGraph graph={graph} selected={selected} />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">
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

function Header() {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white/70 px-5 py-3 backdrop-blur">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm">
          <Network size={17} />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight text-slate-900">
            Warm-Intro Autopilot
          </p>
          <p className="text-[11px] leading-none text-slate-400">
            Two-sided · declared · warm
          </p>
        </div>
      </div>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50/60 px-2.5 py-1 text-[11px] font-medium text-indigo-600">
        <Sparkles size={12} />
        Demo network
      </span>
    </header>
  );
}

function GraphLegend({ selected }: { selected: MatchResult | null }) {
  return (
    <div className="pointer-events-none absolute bottom-4 left-4 rounded-xl border border-slate-200/80 bg-white/80 px-3.5 py-2.5 text-[11px] shadow-sm backdrop-blur">
      {selected ? (
        <div className="flex items-center gap-2 font-medium text-slate-600">
          <span className="inline-block h-1 w-6 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500" />
          Warm path to {selected.persona.name.split(" ")[0]}
        </div>
      ) : (
        <div className="flex items-center gap-2 font-medium text-slate-500">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-300" />
          Select a match to trace the warm path
        </div>
      )}
    </div>
  );
}
