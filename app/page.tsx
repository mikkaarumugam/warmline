"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Inbox, Loader2, Network, Search, Send, Sparkles } from "lucide-react";
import type {
  Graph,
  InboundDisposition,
  InboundRequestView,
  IntroResponse,
  MatchResponse,
  MatchResult,
  Persona,
  SentRequest,
  VouchRequestView,
} from "@/lib/types";
import { matchAskClient } from "@/lib/engine/match-client";
import { cn } from "@/components/ui/cn";
import { Onboarding } from "@/components/Onboarding";
import { AskBar } from "@/components/AskBar";
import { YouCard } from "@/components/YouCard";
import { ResultsPanel } from "@/components/ResultsPanel";
import { VouchInbox } from "@/components/VouchInbox";
import { InboundInbox, resolveInbound } from "@/components/InboundInbox";
import { ConnectionsPanel, type Connection } from "@/components/ConnectionsPanel";
import { SentInbox } from "@/components/SentInbox";
import { IntroModal, type Stage } from "@/components/IntroModal";
import { NetworkGraph } from "@/components/graph/NetworkGraph";
import { SENT_SEED } from "@/data/seed/sent";

type Tab = "matches" | "inbox" | "sent" | "vouches";

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
  // stage/booked the modal opens at — "draft" for a fresh intro, a later stage
  // when resuming a sent request from the Sent tab.
  const [introStage, setIntroStage] = useState<Stage>("draft");
  const [introBooked, setIntroBooked] = useState(false);

  const [tab, setTab] = useState<Tab>("matches");
  const [vouchCount, setVouchCount] = useState(0);
  const [matchError, setMatchError] = useState(false);
  // One-time: true only while the embedding model downloads on the first search.
  const [modelLoading, setModelLoading] = useState(false);

  // intros you've sent (newest first) — populated by the seed + live sends
  const [sentRequests, setSentRequests] = useState<SentRequest[]>([]);

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

  // seed the Sent tab once the graph loads (resolve raw ids → a synthetic match +
  // intro so a seeded card can reopen the flow exactly like a live one)
  useEffect(() => {
    if (!graph) return;
    const byId = new Map(graph.personas.map((p) => [p.id, p]));
    const seeded: SentRequest[] = SENT_SEED.flatMap((s) => {
      const target = byId.get(s.targetId);
      if (!target) return [];
      const mutual = s.mutualId ? byId.get(s.mutualId) : undefined;
      const match: MatchResult = {
        persona: target,
        mutual,
        score: 0.9,
        warmth: mutual ? 0.66 : 1,
        rank: 0.9,
        path: {
          nodes: mutual ? [graph.me, mutual.id, target.id] : [graph.me, target.id],
          degree: mutual ? 2 : 1,
        },
      };
      return [
        {
          id: target.id,
          match,
          intro: { message: s.message, generatedBy: "template" as const },
          status: s.status,
          responseNote: s.responseNote,
          booked: false,
          ask: s.ask,
          sentAt: Date.now() - s.ageMinutes * 60_000,
        },
      ];
    });
    setSentRequests(seeded);
  }, [graph]);

  // record an outbound request when you hit "Send" in the intro modal (de-dupe by
  // target, newest first); flip it to "connected"/"booked" as the flow completes.
  const recordSent = useCallback(
    (r: MatchResult, sentIntro: IntroResponse) => {
      setSentRequests((prev) => [
        {
          id: r.persona.id,
          match: r,
          intro: sentIntro,
          status: "pending" as const,
          booked: false,
          ask,
          sentAt: Date.now(),
        },
        ...prev.filter((s) => s.id !== r.persona.id),
      ]);
    },
    [ask]
  );

  const markConnected = useCallback((personaId: string) => {
    setSentRequests((prev) =>
      prev.map((s) => (s.id === personaId ? { ...s, status: "connected" } : s))
    );
  }, []);

  const markBooked = useCallback((personaId: string) => {
    setSentRequests((prev) =>
      prev.map((s) =>
        s.id === personaId ? { ...s, status: "connected", booked: true } : s
      )
    );
  }, []);

  // resume a sent request from the Sent tab — reopen the modal at where it stands
  // ("connected" jumps straight to booking; "pending" shows the waiting state).
  const openSent = useCallback((req: SentRequest) => {
    setSelected(req.match); // light its warm path on the graph
    setIntroMatch(req.match);
    setIntro(req.intro);
    setIntroLoading(false);
    setIntroStage(req.status === "connected" ? "connected" : "sent");
    setIntroBooked(Boolean(req.booked));
    setIntroOpen(true);
  }, []);

  // Direction A: every tab lights its relevant path on the graph. We feed the
  // shared highlighter a synthetic match carrying the right path nodes.
  const selectInbound = useCallback(
    (v: InboundRequestView) => {
      if (!graph) return;
      const nodes = v.mutual
        ? [graph.me, v.mutual.id, v.requester.id]
        : [graph.me, v.requester.id];
      setSelected(synthMatch(v.requester, nodes, v.mutual));
    },
    [graph]
  );

  const selectVouch = useCallback(
    (v: VouchRequestView) => {
      if (!graph) return;
      // you bridge requester → target
      setSelected(synthMatch(v.target, [v.requester.id, graph.me, v.target.id]));
    },
    [graph]
  );

  // ── inbound queue + the relationship layer ──────────────────────────
  const inboundViews = useMemo(
    () => (graph ? resolveInbound(graph.personas) : []),
    [graph]
  );
  const [inboundState, setInboundState] = useState<
    Record<string, { disposition: InboundDisposition; booked: boolean }>
  >({});

  const handleInboundChange = useCallback(
    (id: string, disposition: InboundDisposition, booked: boolean) => {
      setInboundState((prev) => ({ ...prev, [id]: { disposition, booked } }));
    },
    []
  );

  // badge reflects only what still needs you (a queue, not a pile)
  const inboxOpenCount = inboundViews.filter(
    (v) => (inboundState[v.id]?.disposition ?? "open") === "open"
  ).length;

  // connections = accepted inbound + booked outbound (de-duped by person)
  const connections: Connection[] = useMemo(() => {
    const out: Connection[] = [];
    const seen = new Set<string>();
    for (const v of inboundViews) {
      if (inboundState[v.id]?.disposition === "accepted" && !seen.has(v.requester.id)) {
        seen.add(v.requester.id);
        out.push({ id: v.requester.id, persona: v.requester, via: v.mutual, source: "inbound" });
      }
    }
    for (const r of sentRequests) {
      if (r.booked && !seen.has(r.match.persona.id)) {
        seen.add(r.match.persona.id);
        out.push({ id: r.match.persona.id, persona: r.match.persona, via: r.match.mutual, source: "outbound" });
      }
    }
    return out;
  }, [inboundViews, inboundState, sentRequests]);

  const connectionIds = useMemo(() => connections.map((c) => c.id), [connections]);

  // brief callout when a new connection forms — seals the "network grew" beat
  const [connToast, setConnToast] = useState<string | null>(null);
  const prevConnIdsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const added = connections.find((c) => !prevConnIdsRef.current.has(c.id));
    prevConnIdsRef.current = new Set(connections.map((c) => c.id));
    if (!added) return;
    setConnToast(`${added.persona.name.split(" ")[0]} is now a connection`);
    const t = setTimeout(() => setConnToast(null), 2600);
    return () => clearTimeout(t);
  }, [connections]);

  const selectConnection = useCallback(
    (c: Connection) => {
      if (!graph) return;
      const nodes = c.via
        ? [graph.me, c.via.id, c.persona.id]
        : [graph.me, c.persona.id];
      setSelected(synthMatch(c.persona, nodes, c.via));
    },
    [graph]
  );

  const runMatch = useCallback(async () => {
    if (!ask.trim() || !graph) return;
    setMatching(true);
    setSelected(null);
    setMatchError(false);
    try {
      // Primary path: run the embedding model CLIENT-SIDE (WASM backend) so it
      // works on Vercel's serverless, where the server engine's native
      // onnxruntime .so can't load. The model downloads once on the first search
      // (onColdLoad drives the "loading model…" banner), then caches in-browser.
      const next = await matchAskClient(graph, ask, graph.me, () =>
        setModelLoading(true)
      );
      setResults(next);
      setSearched(true);
      // auto-select the top match so the graph lights up immediately
      setSelected(next[0] ?? null);
    } catch (clientErr) {
      // Fallback: the server /api/match route (works locally; may 500 on Vercel).
      try {
        const res = await fetch("/api/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ask }),
        });
        if (!res.ok) throw new Error(`match failed: ${res.status}`);
        const data: MatchResponse = await res.json();
        const next = data.results ?? [];
        setResults(next);
        setSearched(true);
        setSelected(next[0] ?? null);
      } catch {
        // surface the failure instead of silently reverting to the empty state
        console.error("match failed (client + fallback)", clientErr);
        setResults([]);
        setSearched(true);
        setMatchError(true);
      }
    } finally {
      setModelLoading(false);
      setMatching(false);
    }
  }, [ask, graph]);

  const draftIntro = useCallback(
    async (r: MatchResult) => {
      setIntroMatch(r);
      setIntro(null);
      setIntroLoading(true);
      setIntroStage("draft");
      setIntroBooked(false);
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
          <TabSwitcher
            tab={tab}
            setTab={setTab}
            inboxCount={inboxOpenCount}
            sentCount={sentRequests.length}
            vouchCount={vouchCount}
          />

          {tab === "matches" && (
            <>
              <AskBar
                value={ask}
                onChange={setAsk}
                onSubmit={runMatch}
                loading={matching}
              />
              {modelLoading && (
                <div className="flex items-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-3.5 py-2.5 text-[12px] font-medium text-indigo-200">
                  <Loader2 size={14} className="animate-spin" />
                  Loading the match model… one-time download, then it runs
                  instantly in your browser.
                </div>
              )}
              {me && <YouCard me={me} />}
              {graph && (
                <ResultsPanel
                  graph={graph}
                  // already-connected people aren't prospects — drop them from
                  // matches (display only; the engine is the parallel session's).
                  results={results.filter(
                    (r) => !connectionIds.includes(r.persona.id)
                  )}
                  loading={matching}
                  searched={searched}
                  error={matchError}
                  onRetry={runMatch}
                  selectedId={selected?.persona.id ?? null}
                  onSelect={setSelected}
                  onDraft={draftIntro}
                />
              )}
            </>
          )}

          {tab === "inbox" && (
            <InboundInbox
              graph={graph}
              onSelect={selectInbound}
              onChange={handleInboundChange}
            />
          )}
          {tab === "sent" && (
            <SentInbox requests={sentRequests} onOpen={openSent} />
          )}
          {tab === "vouches" && <VouchInbox onSelect={selectVouch} />}
        </aside>

        {/* ── Right: the network graph (money shot) ──────────────────── */}
        <section className="relative min-h-0 bg-[#070710]">
          {/* faint radial glow centered on the ego node */}
          <div className="pointer-events-none absolute inset-0 [background:radial-gradient(620px_460px_at_50%_46%,rgba(99,102,241,0.14),transparent_70%)]" />
          {graph ? (
            <NetworkGraph
              graph={graph}
              selected={selected}
              connectionIds={connectionIds}
              onRevealDone={() => setSelected(null)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500">
              <Loader2 size={20} className="mr-2 animate-spin" />
              Mapping your network…
            </div>
          )}

          <ConnectionsPanel connections={connections} onSelect={selectConnection} />
          {connToast && (
            <div className="animate-rise pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full border border-emerald-400/30 bg-emerald-400/15 px-4 py-1.5 text-xs font-semibold text-emerald-100 shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
              ✓ {connToast}
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
        initialStage={introStage}
        initialBooked={introBooked}
        onSent={recordSent}
        onConnected={markConnected}
        onBooked={markBooked}
      />
    </div>
  );
}

/** Build a throwaway MatchResult purely to highlight a path on the graph. */
function synthMatch(
  persona: Persona,
  pathNodes: string[],
  mutual?: Persona
): MatchResult {
  return {
    persona,
    mutual,
    score: 1,
    warmth: 1,
    rank: 1,
    path: { nodes: pathNodes, degree: pathNodes.length >= 3 ? 2 : 1 },
  };
}

function TabSwitcher({
  tab,
  setTab,
  inboxCount,
  sentCount,
  vouchCount,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  inboxCount: number;
  sentCount: number;
  vouchCount: number;
}) {
  return (
    <div className="flex gap-1 rounded-xl border border-white/[0.07] bg-white/[0.03] p-1">
      <TabButton active={tab === "matches"} onClick={() => setTab("matches")}>
        <Search size={13} />
        Matches
      </TabButton>
      <TabButton active={tab === "inbox"} onClick={() => setTab("inbox")}>
        <Inbox size={13} />
        Inbox
        <CountBadge count={inboxCount} active={tab === "inbox"} />
      </TabButton>
      <TabButton active={tab === "sent"} onClick={() => setTab("sent")}>
        <Send size={13} />
        Sent
        <CountBadge count={sentCount} active={tab === "sent"} />
      </TabButton>
      <TabButton active={tab === "vouches"} onClick={() => setTab("vouches")}>
        <Sparkles size={13} />
        Vouches
        <CountBadge count={vouchCount} active={tab === "vouches"} />
      </TabButton>
    </div>
  );
}

function CountBadge({ count, active }: { count: number; active: boolean }) {
  if (count <= 0) return null;
  return (
    <span
      className={cn(
        "ml-0.5 shrink-0 rounded-full px-1 text-[9px] font-bold tabular-nums",
        active ? "bg-white/20 text-white" : "bg-violet-500/25 text-violet-200"
      )}
    >
      {count}
    </span>
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
        "flex min-w-0 flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-lg px-1.5 py-2 text-[11px] font-semibold transition",
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
