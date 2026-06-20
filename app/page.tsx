"use client";

import { useState } from "react";
import type { IntroResponse, MatchResponse, MatchResult } from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// SPINE reference UI — intentionally plain. Proves the end-to-end loop works:
//   type an ask → /api/match → ranked warm matches → /api/intro → drafted intro.
// Track B replaces this with the polished v0 UI + React Flow warm-path graph.
// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const [ask, setAsk] = useState(
    "A technical cofounder who knows payments infrastructure"
  );
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [intro, setIntro] = useState<string | null>(null);

  async function runMatch() {
    setLoading(true);
    setIntro(null);
    const res = await fetch("/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ask }),
    });
    const data: MatchResponse = await res.json();
    setResults(data.results ?? []);
    setLoading(false);
  }

  async function draftIntro(r: MatchResult) {
    setIntro("Drafting…");
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
    setIntro(data.message);
  }

  return (
    <main className="mx-auto max-w-2xl p-8 font-sans">
      <h1 className="text-2xl font-bold">Warm-Intro Autopilot — spine</h1>
      <p className="mt-1 text-sm text-gray-500">
        Two-sided, declared warm-intro marketplace. Post an ask → matched on
        others&apos; declared offers → routed through your mutual contact.
      </p>

      <div className="mt-6 flex gap-2">
        <input
          value={ask}
          onChange={(e) => setAsk(e.target.value)}
          className="flex-1 rounded border px-3 py-2"
          placeholder="What are you looking for?"
        />
        <button
          onClick={runMatch}
          disabled={loading}
          className="rounded bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Matching…" : "Find warm intros"}
        </button>
      </div>

      <ul className="mt-6 space-y-3">
        {results.map((r) => (
          <li key={r.persona.id} className="rounded border p-4">
            <div className="flex items-baseline justify-between">
              <span className="font-semibold">{r.persona.name}</span>
              <span className="text-xs text-gray-500">
                match {(r.score * 100) | 0}% · {r.path.degree === 1 ? "1st" : "2nd"} degree
              </span>
            </div>
            <p className="text-sm text-gray-600">{r.persona.offer}</p>
            <p className="mt-1 text-xs text-indigo-600">
              Warm path: You {r.mutual ? `→ ${r.mutual.name} ` : ""}→ {r.persona.name}
            </p>
            <button
              onClick={() => draftIntro(r)}
              className="mt-2 rounded border border-indigo-600 px-3 py-1 text-xs text-indigo-600"
            >
              Draft intro
            </button>
          </li>
        ))}
      </ul>

      {intro && (
        <pre className="mt-6 whitespace-pre-wrap rounded bg-gray-50 p-4 text-sm">
          {intro}
        </pre>
      )}
    </main>
  );
}
