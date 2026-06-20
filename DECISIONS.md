# Product Decisions & Flow Rationale

Living record of the **product** decisions behind Warmline and *why* we made them.
Read this before changing any flow — the reasoning is the part that's expensive to
re-derive. (Build contract is in `CONTRACT.md`; submission status in `SUBMISSION.md`.)

## The wedge (don't drift from this)
A **two-sided, declared** warm-intro marketplace. Everyone declares an **offer**
(what they help with) and an **ask** (what they need). Post an ask → semantic match
against others' declared offers across your 1st/2nd-degree network → surface the
**warm path** (You → mutual → target) → draft the intro + route a vouch.
Differentiator vs Happenstance / Swarm / Vieu: **two-sided + declared**, not
one-sided + inferred (they scrape/guess; here both parties opt in and state intent).

## The vouch = SIGNAL, not GATE (core insight)
The mutual **never blocks** a connection — they add a **1–10 confidence + note** that
*amplifies* it. This is the answer to the #1 objection ("what if the mutual is too
busy?") and the thing that makes the marketplace liquid.

- **Two bases for reaching someone, doing different jobs:**
  1. **Permission = the target declared** (raised their hand / opted in). This is the
     anti-spam gate. *Sharing a mutual alone is NOT sufficient* — that's just
     degree-based LinkedIn spam.
  2. **Warmth = you share the mutual.** Makes the approach warm, not cold.
  - The **vouch** is the trust signal stacked on top.
- **Serial gate (mutual relays the message) = WRONG** — that's the bottleneck that
  kills every warm-intro product. **Parallel signal = RIGHT**: the platform delivers
  your request to the target (they opted in), and the mutual is pinged *alongside*
  for an optional vouch. If the mutual is silent, the request **still reaches the
  target**, just without the endorsement.
- The vouch is **low-effort (a tap)**, so it actually gets done — that's the liquidity
  unlock. It can also **drive ranking/priority** in the target's inbox.
- One-liner test: *"You can only reach people who declared they're open (consented),
  every request rides on a real mutual (warm), the mutual can vouch to boost it
  (signal) — but can never block it (no gatekeeper)."*

## The intro draft = YOUR voice, forwardable
- The note is a **forwardable self-intro in the asker's (your) own voice**, addressed
  to the target, that references the shared mutual who can vouch.
- **NOT written in the mutual's voice** — that was redundant with the vouch (the mutual
  would "speak" twice) and felt like ghost-writing them.
- The request goes **from you → the target** (platform-delivered). It is **not** "send
  to the mutual" — that re-introduces the gate.
- The vouch **backs the asker** ("sharp founder, worth your time"), it does **not**
  describe the target. It appears **after** you send the request (causally earned),
  never at discovery time.
- Two-sidedness is shown on **one account**: you *receive* vouches (in the intro flow)
  and *give* them (the "Vouch requests" inbox tab). Same mechanic, both directions.

## The handoff = own the intro, NOT the conversation
- **No in-app messaging.** People don't want another inbox; warm intros flow to email /
  LinkedIn / calendar. Owning the intro + trust is the defensible, monetizable layer;
  owning chat is scope-creep that loses to iMessage/Slack.
- On accept (double opt-in — target accepts before anything is revealed), hand off:
  - **"Book a call" (calendar) = hero CTA.** Converts straight to the actual goal and
    exposes **zero PII**.
  - **Email = baseline channel.**
  - **Phone = progressive opt-in** ("shared after your first call, never by default").
- Why not phone-first: privacy + irreversibility + wrong norm for a professional first
  touch + onboarding friction. Principle: **reveal the least-sensitive channel that
  still gets them talking.**

## Onboarding framing
"Import from LinkedIn (coming soon)" seeds **edges only** (who-knows-who). Offers/asks
are **always declared, never scraped** — this reinforces the wedge instead of
undercutting it. Keep it out of the hero matching flow (no dead buttons there).

## Growth model & the LinkedIn question (GTM — pitch, NOT the hackathon build)
- **Sign in with LinkedIn = identity, NOT the network.** LinkedIn's OAuth/OIDC returns
  name/headline/photo/email (auto-fills the profile, adds trust, easy + sanctioned to
  build). It does **not** return connections — never conflate the two.
- **Importing the connections CSV is a trap.** It gives you *names*, not opted-in users —
  a graph of **ghosts** who can't receive intros or vouch. It also quietly breaks our own
  "declared, consented, not scraped" wedge (storing people who never opted in), and
  LinkedIn now strips emails from exports. Its ONE legit use: a checklist of *who to invite*.
- **The graph grows by INVITES, not imports.** You don't copy edges from LinkedIn; you
  re-create them as real, consented edges when people join:
  join → declare offer/ask → invite people you actually know → they join + declare →
  a both-sides-confirmed edge forms → their invites grow your 2nd degree. Every edge is
  real and opted-in.
- **Cold start: go community-first.** Seed one dense pocket (an accelerator batch, a
  company's alumni, one city's fintech) so warm paths exist immediately — the
  Facebook/LinkedIn "one campus at a time" playbook. The **vouch inbox is itself a growth
  hook** (people get pulled back to vouch, which re-engages them).
- **Pitch one-liner:** *"Sign in with LinkedIn for who you are → invite the people you
  actually know → everyone declares what they offer and need. The graph grows consented,
  one real edge at a time — we never scrape."* Stronger than "import from LinkedIn":
  honest, and it dodges the impossible part. Prime Solvimon (successful-business) material.

## Golden path / demo (must always hold)
Ask **"a technical cofounder who knows payments infrastructure"** → **Samuel Okoro**
(payments infra, ex-Adyen) #1 **via Priya** (2nd degree). Semantic, not keyword
("billing systems" ≈ "billing and ledger systems"). Backup asks: "a designer who has
worked on money flows" → Marco via Priya; "an intro to someone hiring in healthtech" →
Priyanka via Dana; "a B2B growth marketer…" → Marcus (1st degree).

## Key technical choices
- **Local semantic embeddings** (transformers.js, MiniLM, no API key) — privacy +
  zero-setup story. NOTE: the native backend can't run on Vercel serverless →
  **moving matching client-side** (runs in the browser; also a privacy upgrade).
- **No database.** 94-persona seed; ego-network graph (You center → 1st-degree ring →
  2nd-degree branches), center-to-center floating edges, tree-only (no stray links).
- **Claude** drafts intros, with a deterministic template fallback (no key → template).
- Dark **Obsidian** theme.

## Bounty strategy
Target **Solvimon** ("most likely to be a successful business"). **Forwent** the Vercel
bounty (so we're not tied to Vercel). Skipped Codeplain/Sui/BGA/Bilt/FLock.

## Open / in-flight decisions
- **Flow-timing & waiting states (ACTIVE — being worked next):** the intro flow has
  faked stages in `components/IntroModal.tsx` — `draft → sent → vouched → connected` —
  advanced by `setTimeout` (~1.2s, ~2.8s) to simulate "request sent → mutual vouches →
  target accepts." Real life isn't instant: the target may take hours to accept, the
  mutual to vouch. **Open question:** how should the UI represent *waiting* honestly
  while staying controllable in a live demo? Options on the table: faster staged reveal,
  **click-to-advance** (demo control), instant-staggered, or an honest **pending** state
  ("Request sent · we'll let you know when Samuel responds") with the accept/booking as a
  later notification. Decide the *feel*, then wire it in `IntroModal.tsx` only.
  ⚠️ Do NOT touch the match path (`app/page.tsx` runMatch, `lib/engine/match*`,
  `app/api/match|personas`) — a parallel session owns the client-side refactor there.
- **Client-side matching refactor** (Option A) — a parallel session is moving matching
  into the browser to fix the live Vercel `/api/match` 500. When it lands, its branch
  must be merged back into the working branch (disjoint files → clean merge).
- **Streaming intro draft** — only worth it if an `ANTHROPIC_API_KEY` is set (else the
  template is instant anyway).

## Run / verify (operational)
`npm run dev` → http://localhost:3000. Golden-path check: post the hero ask → Samuel #1
via Priya. For visual checks, a throwaway `playwright-core` driving the system Chrome
works (see how prior screenshots were taken). Keep `npm run build` green.
