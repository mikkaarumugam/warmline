# Warm-Intro Autopilot — build contract

Two-sided, **declared** warm-intro marketplace. Everyone declares an **offer** (what
they help with) and an **ask** (what they need). Post an ask → semantically match it
against others' declared **offers** across your 1st- and 2nd-degree network → surface
matches **with the warm path** (You → mutual → target) → one-click draft the intro the
mutual would send. Differentiator vs Happenstance/Swarm/Vieu: two-sided + declared, not
one-sided + inferred.

## Frozen contract (do not change shapes without coordinating)
`lib/types.ts` — `Persona | Edge | Graph | Path | MatchResult | Match/IntroRequest/Response`.
All tracks build against these. API routes are stable; swap internals, not signatures.

## API (stable)
- `GET /api/personas` → `Graph` (nodes + edges) for the viz.
- `POST /api/match` `{ ask, meId? }` → `MatchResponse` (ranked `MatchResult[]`).
- `POST /api/intro` `IntroRequest` → `IntroResponse` (drafted message).

Data flows through `lib/data.ts#getGraph()` — swap its internals to load real seed.

## Track ownership (disjoint files = no merge conflicts)
- **Track A — Engine** → `lib/engine/*`. Replace the naive word-overlap in
  `lib/engine/match.ts#scoreOffer` with **local embeddings (transformers.js, no API key)**
  of the live ask vs each persona's `offer` (precompute/cache persona vectors), cosine
  similarity. Keep `matchAsk()` signature + `MatchResult` shape. `paths.ts` (BFS ≤2) is done.
- **Track B — Frontend** → `app/(ui)/*`, `components/*`. Ask input, ranked results, **React
  Flow** warm-path animation, intro modal, and the static **"Import from LinkedIn (coming
  soon)"** onboarding screen (edges-only framing; offer/ask always declared). Build against
  the API contract. Replace the plain reference UI in `app/page.tsx`.
- **Track C — Seed + Intro + Pitch** → `data/seed/*`, `lib/intro/*`, `pitch/*`. Generate
  80–120 clustered personas with declared offer/ask + hand-curated hero paths; wire
  `lib/data.ts` to load them. Add the **Claude** intro path in `lib/intro/*` (Anthropic SDK,
  `claude-sonnet-4-6`; fall back to `templateIntro` when `ANTHROPIC_API_KEY` is unset).

## Golden path (must always work in the demo)
Ask "a technical cofounder who knows payments infrastructure" → **Samuel Okoro** (payments
infra, ex-Adyen) ranks #1 **via Priya Nair** (2nd degree). Preserve this when expanding seed.

## Run / verify
- `npm run dev` → http://localhost:3000
- `npm run build` must stay green.
- Smoke: `POST /api/match` returns Samuel #1; `POST /api/intro` returns a coherent message.

## Caveat
Next.js **16** (Turbopack) — conventions differ from older versions; see `AGENTS.md`.
