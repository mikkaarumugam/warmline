# Warmline — Warm-Intro Autopilot

**The only warm-intro marketplace where both sides declare what they offer and what they need.**

🔗 **Live demo:** [warmline-nu.vercel.app](https://warmline-nu.vercel.app)

Happenstance, Swarm, and Vieu all *infer* intent from passive signals — LinkedIn activity,
calendar data, email metadata. Warmline is different: every person in your network
declares an explicit **offer** ("here's how I can help") and an explicit **ask** ("here's
what I need right now"). Post your ask and Warmline semantically matches it against
everyone's declared offers across your 1st- and 2nd-degree network, surfaces the **warm
path** to each match, and one-click drafts the intro — **in your own voice**, ready to
forward, with the mutual **vouching** to back it.

Two-sided + declared beats one-sided + inferred because the signal is intentional,
current, and **consent-first** from day one. We never scrape.

---

## Screenshots

**Network ego-graph — idle state**

![Warmline network ego-graph](public/screenshots/g_idle.png)

**Warm path highlighted — Samuel Okoro via Priya Nair**

![Warm path highlighted after match](public/screenshots/g_selected.png)

**Onboarding — declare your offer & ask, grow by invites**

![Onboarding screen](public/screenshots/01_onboarding.png)

---

## How it works

1. **Declare your offer and ask.** Every person has a short offer ("what I can help with")
   and a short ask ("what I need right now"). These are **explicit and editable — never
   inferred** from passive behavior or scraped.

2. **Post your ask.** Type what you're looking for in plain English. Example:
   *"a technical cofounder who knows payments infrastructure"*.

3. **Semantic match across your warm network — in your browser.** Warmline embeds your ask
   and every reachable person's declared offer with a local sentence model
   (`Xenova/all-MiniLM-L6-v2`) running **client-side in WebAssembly** — no API key, and
   **your ask never leaves your device**. Cosine similarity finds meaning, not word
   overlap: *"payments infrastructure"* and *"billing and ledger systems"* score as
   near-identical even though they share no rare tokens.

4. **Warm-path BFS (depth 2).** Matching is scoped to your 1st- and 2nd-degree connections
   only. Ranking blends semantic score with path warmth, so a strong 2nd-degree match can
   beat a weak direct one — while closeness nudges comparable people up. Each result shows
   **both sides** when expanded: the target's offer *and* their declared ask, so you can
   see the mutual fit.

5. **Animated warm-path graph.** The React Flow ego-graph lights up the exact path: *You →
   Priya Nair → Samuel Okoro*. You see who to ask, not just who to reach.

6. **One-click intro — in your voice.** "Draft intro" writes a forwardable self-intro
   addressed to the target, referencing the shared mutual, via Claude
   (`claude-sonnet-4-6`; a deterministic template fills in when `ANTHROPIC_API_KEY` is
   unset). It's **your** message — not ghost-written in the mutual's voice.

7. **Send → vouch → accept → book.** The request reaches the target because *they declared
   they're open* (the anti-spam gate). The mutual is pinged **in parallel** to add a
   **vouch** — a confidence score + note that boosts the request but **can never block it**
   (signal, not gatekeeper). On accept, Warmline hands off to a **zero-PII "book a call"** —
   we own the intro and the trust, not the chat. Accepted intros **grow your consented
   graph**: the new connection animates into your 1st-degree ring.

---

## The vouch = signal, not a gate (the core insight)

Every warm-intro product dies on the same bottleneck: the busy mutual who has to relay your
message. Warmline removes the gate. **Permission** comes from the target having declared
they're open; **warmth** comes from the shared mutual; the **vouch** is a low-effort tap
that *amplifies* the request and can drive its ranking in the recipient's inbox — but the
mutual can never block it. If they're silent, the request still arrives, just without the
endorsement. That's what keeps the marketplace liquid.

It's **two-sided on one account**: you *receive* vouches (in your intro flow) and *give*
them (the Vouches inbox) — same mechanic, both directions. Four surfaces complete the loop:
**Matches · Inbox · Sent · Vouches**.

---

## Golden-path demo

**Ask:** `a technical cofounder who knows payments infrastructure`

**Result #1:** Samuel Okoro — *"Payments infrastructure engineer, ex-Adyen"* — via Priya
Nair (2nd degree).

- **His declared offer:** *"Technical cofounder material: a payments-infrastructure engineer
  (ex-Adyen) who builds billing, ledger, and payment-rail systems from scratch."* — a
  semantic match to the ask despite **zero shared keywords**.
- **His declared ask:** *"An early-stage fintech to join as a technical cofounder."* — which
  is exactly what you are. **Both sides declared it; both want each other.**

A keyword matcher would miss this entirely.

---

## Business — why it's a company, not just a demo

- **Customer:** founders, B2B sales/BD, recruiters — people whose job *is* warm intros.
- **Monetization (anchored, see [`pitch/pricing.md`](pitch/pricing.md)):** Free
  (acquisition) → **Pro $49/seat/mo** (below LinkedIn Sales Navigator's $99 — warm +
  consented beats cold + inferred) → **Community from ~$12k/yr** (accelerators, VC funds,
  alumni networks license it for members — recurring, sticky). Plus a **success fee** on
  booked hire intros — a fraction of a 15–25% recruiting-agency fee.
- **GTM:** the graph grows by **invites, never scraping** — sign in with LinkedIn for
  *identity only*, invite people you actually know, every edge consented. Cold-start
  community-first.
- **Moat:** the consented, declared graph + the trust layer — a data network effect that
  competitors who *infer* can't copy.

Full pitch in [`pitch/`](pitch/) — deck, pricing rationale, and submission writeup.

---

## Architecture

| Layer | What it does |
|---|---|
| **Next.js 16 (App Router, Turbopack)** | Full-stack framework, deployed on Vercel |
| **`lib/engine/match-client.ts`** | Primary matcher — `Xenova/all-MiniLM-L6-v2` via `@huggingface/transformers` running **client-side in WASM**; offer vectors precomputed at build time, only the live ask is embedded at search time. Your ask never leaves the browser |
| **`lib/engine/match.ts`** | Server-side fallback (model-free lexical score) for `/api/match` — kept out of serverless traces so the function stays under Vercel's size limit |
| **`lib/engine/paths.ts`** | BFS depth-2 warm-path finder over an undirected adjacency map |
| **`components/`** | React Flow ego-graph with animated warm-path highlights + a reactive connections layer; ranked match cards; intro/vouch/book modal |
| **`lib/intro/claude.ts`** | Claude-drafted intros (`claude-sonnet-4-6`); throws on error so the API route falls back to `templateIntro` cleanly |
| **`data/seed/network.ts`** | 94 personas across 12 communities; edges clustered inside communities with sparse cross-cluster bridges |
| **No database** | Data flows through a module-level `getGraph()`; swap internals without touching any API signature |

### API (stable, frozen contract)

```
GET  /api/personas                    →  Graph  (nodes + edges for the viz)
POST /api/match  { ask, meId? }       →  MatchResponse  (ranked MatchResult[])
POST /api/intro  IntroRequest         →  IntroResponse  (drafted message + source)
```

---

## Running locally

```bash
npm install
npm run dev
# → http://localhost:3000
```

Semantic matching runs in the browser (WASM) — no key needed. **Optional — enable
Claude-drafted intros** (otherwise a deterministic template is used automatically):

```bash
ANTHROPIC_API_KEY=sk-ant-... npm run dev
```

**Smoke-test:**

```bash
npm run build   # must stay green
# golden path: post the hero ask in the UI → Samuel Okoro ranks #1 via Priya
```

---

## Built with parallel agents

The codebase was designed spine-first for parallel execution. The type contract
(`lib/types.ts`) and the three API signatures were frozen upfront, then three disjoint
agent tracks ran simultaneously with zero merge conflicts by design:

- **Track A — Engine:** local embedding pipeline, cosine similarity, offer-vector cache.
- **Track B — Frontend:** onboarding, ranked match cards, React Flow warm-path animation,
  intro/vouch/book flow.
- **Track C — Seed + Intro:** 94-persona clustered seed with hand-curated golden path,
  Claude intro module with template fallback.

The frozen contract let each track build and test in isolation against the same interface.

---

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) — deployed on Vercel
- [@huggingface/transformers](https://github.com/xenova/transformers.js) — local sentence
  embeddings in the browser (WASM), no API key required
- [React Flow](https://reactflow.dev) — interactive warm-path network graph
- [Anthropic SDK](https://github.com/anthropics/anthropic-sdk-typescript) / `claude-sonnet-4-6` — intro drafting
- TypeScript throughout

---

*Encode Vibe Coding Hackathon — June 2026*
