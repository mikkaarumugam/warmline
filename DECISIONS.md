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

## Replies = own the decision, not the dialogue
Refines "no in-app messaging" (above) rather than contradicting it. Recipients **can**
answer — with a **disposition** (Accept / Decline / "not now") plus an **optional real
message in their own words** (a genuine "say something," not a canned line). It
*resolves* the request (accept → book, decline → closed) and hands off; the message is
**one shot that rides with the reply** — it never opens a thread. The test: does the
response **terminate in a handoff** or **invite another reply in-app**? Terminate = we
own it (the trust layer); invite-another = punt to email / Slack / iMessage. (If you
need to ask a question before deciding: Decline-with-a-question or "not now" — you don't
open an inbox.)
- A **decline-with-reason** ("not now, ping me in Q3") is a feature, not a failure: it
  gives the asker closure (silence is what kills warm-intro products) and is an anti-spam
  signal. Shown as a terminal **"Declined"** card, not resumable.
- The **asker's** reply is the **booking** — also a disposition, not a message.
- Accept notes are deterministic per person (a stable demo stand-in for a real reply);
  only declines are seeded. Shown in the handoff + on the Sent card.
- **The asker's** reply is the **booking** — also a disposition, not a message.

## The inbound side = respond, don't chat (the recipient surface)
The surface that completes two-sidedness on one account: **Matches / Sent** (you ask) ·
**Vouches** (you back others) · **Inbox** (someone warm-intros *you*). You answer with a
disposition + optional message (see Replies above):
Accept → the same book-a-call handoff (zero-PII); Decline → a graceful terminal no; Not
now → snooze. No thread, ever.
- **The vouch does its most important work HERE**, as *decision-support*: "Priya 9/10 —
  worth your time" is what earns a stranger a yes. The asker-side vouch (shown after you
  send) is secondary to this.
- A request with **no vouch still arrives** (signal, not gate) — its absence is shown
  honestly ("no vouch yet — your call"), never as a block.
- Accepting is the **double-opt-in gate**: consented + warm + (maybe) vouched — you still
  make the final human call.

## The graph = the relationship layer, always reactive (Direction A)
The network graph isn't a Matches feature — it's the **living record of the connections
the flows create**, present on every tab and *reactive*:
- **Every tab lights its path.** Click a Match / Sent / Inbox / Vouch item → its warm path
  highlights (Inbox: *Raj → Priya → You*; Vouches: you as the bridge). One shared
  highlighter (`selected` + a synthetic match carrying the right path nodes).
- **Accepted inbound + booked outbound grow the network**: a direct **emerald You↔person
  edge** appears — distinct from the dashed warm *path* (a relationship now *exists*, vs. a
  route to one) — and the person **animates from their 2nd-degree spot into your 1st-degree
  ring** (grows to 1st-degree size, gets labelled). Driven by a `requestAnimationFrame`
  tween on the real node positions (not a CSS transition — so the edge *tracks* the node
  frame-by-frame), easeOutCubic R2→R1, nudged into a clear angular gap so it doesn't crowd
  its own mutual. The reveal runs **~10s** then **returns to the neutral, unsearched view**
  (selection cleared → no warm-path highlight, fit-all) with the connection + branch left
  as permanent additions — it never gets *stuck* zoomed/highlighted. Off-path edges are
  **hidden during the zoom-in** (and the whole graph is in-frame afterward) so no edge
  trails off-screen as a "line to nowhere."
- **rAF node-animation gotcha:** driving the glide by replacing the *entire* `nodes` array
  each frame makes React Flow re-measure every node continuously, and floating edges (which
  read node internals) return null the whole time → **all edges vanish for ~1.5s.** Fix:
  keep a stable `baseNodes` memo and apply the live positions as a thin overlay that only
  gives the *moving* node a new object reference; the rest keep theirs and their edges stay
  rendered. (`components/graph/NetworkGraph.tsx`.)
- **NEVER animate `transform` on a React Flow node (the "KM on You" bug).** React Flow
  positions every node with inline `transform: translate(x,y)`. The branch contacts had
  `animate-pop`, whose keyframe animates `transform: scale()` with `fill: both` — which
  **permanently overrides** React Flow's translate, snapping the node to the **viewport
  origin (right on "You")**. Symptom was maddening: the node's inline `style.transform`
  read the *correct* branch coords, but `getBoundingClientRect` rendered it on You. Fix:
  reveal with **`animate-fade-in` (opacity only)** — never a transform animation — on RF
  nodes.
- **Branch contacts are pre-rendered, not added on connect.** They exist from mount,
  collapsed (invisible, `opacity:0`) on their parent, with explicit `width/height/measured`;
  revealing is a position + opacity change, not a node *add*. Dynamically *adding* RF nodes
  settles their internals/positions unreliably (stacking, floating edges failing to anchor —
  "branch off to no one"). `useUpdateNodeInternals` (a tiny component inside `<ReactFlow>`)
  is kept as belt-and-suspenders. (NB: a contact reachable via another 1st-degree path, e.g.
  `ethan` via `noor`, stays in *that* branch — shortest warm path, not a bug.)
- **A connection drops out of Matches** (already-connected ≠ prospect) — filtered at the
  **display layer** (`app/page.tsx`, on `connectionIds`), not the match engine (that's the
  parallel session's). And **connecting reveals that person's own contacts** as a fresh
  2nd-degree branch fanning *beyond* them: the product beat is *accepting someone extends
  your reachable network through them.* The seed already wired this (e.g. Samuel →
  Yuki/Ethan/Carlos/Kenji); those contacts sit at 3rd-degree/hidden and — since `match.ts`
  only scores **≤2-degree** personas — can't surface in matches or threaten the golden
  path. Revealed **purely in the viz** (no graph mutation, so matching is untouched),
  ~850ms after the node lands, and the camera **settles framed on You + the connection +
  its new branch** (not the whole graph) so the growth stays the focus.
- **Surfaced as a deliberate reveal** (a connection is a *reveal* — clear the stage, move
  the camera): the graph pans/zooms to frame *You + the incoming node*, then settles back,
  with a brief "X is now a connection" callout. **In the book flow the modal auto-steps
  aside first** — after the "Call booked" beat the modal closes itself and the connection
  is *deferred until then* (`onBooked` fires on close), so the growth never plays hidden
  behind the popup. The inbound accept has no popup, so the camera move alone surfaces it.
- **Connections panel** docked on the graph = the relationship layer (accepted inbound +
  booked outbound); click one to highlight. This is where accepted requests "go."
- Why always-on: an inert persistent graph is dead decoration; a *reactive* one is the
  signature visual AND the thesis made visible. (Rejected: graph only on Matches.)

## Inbox = a queue, not a pile
The Inbox shows what still needs you; its **badge counts only open** requests and
decrements as you accept / decline / snooze. **Sent stays a *tracker*** (all statuses
visible) because it's your pipeline — the asymmetry is intentional: a queue clears, a
tracker accumulates. Accepted → connections (above); declined → graceful terminal close.

## Navigation = one page, four tabs (not separate pages)
Single-page two-pane layout kept (list · **persistent network graph** — its hero canvas;
separate routes/pages would kill that for no gain at demo stage). Four tabs, tight
single-word labels: **Matches · Inbox · Sent · Vouches**. Inbound intro-requests
("Inbox") and vouch-requests ("Vouches") are kept **separate, not merged** — different
jobs (someone reaching *you* vs. asking you to back them to a *third party*), and
conflating them muddies the frame you decide in. Inbox/Sent form a clean inbound/outbound
pair; short labels avoid the triple-"…requests" naming and fit one line. (Briefly merged
them into one "Inbox" to save a tab — reversed it: **clarity beats saving a tab**. If
surfaces keep growing, the next move is a slim left **icon-rail**, not multipage.)

## Connection analytics = prove liquidity, not vanity
A light stats strip on the Sent tab. The headline is the **vouch lift** — acceptance with
a vouch vs. without (e.g. 78% vs 41%, ~1.9×) — because it *proves the core insight*
(vouch = signal); it's the one number to leave a Solvimon judge with. Plus your live
funnel (requested → accepted → booked). Derived from in-memory state + a small seeded
outcome history (`data/seed/stats.ts`) — no tracking infra. Resist vanity counts.

## Waiting & pending states = honest async, presenter-controlled
Real intros aren't instant — the target may accept in hours, the mutual may vouch
whenever they get to it. The intro flow no longer **fakes progress with timers**.
- Later events (the vouch, the accept) arrive as **tappable notification cards** you
  open — exactly how the real product would push them. This is honest (discrete, async
  events) **and** hands the presenter control of every beat in a live demo. Nothing
  auto-advances on a `setTimeout`.
- The resting state is **calm pending, no spinner** — a spinner promises *seconds*, and
  this wait is *hours*; using one is a quiet lie about the timeline. Instead: "Request
  sent · {target} notified" + muted expectation copy ("usually replies within a day —
  we'll ping you here").
- Still drives all the way to the **Book-a-call handoff** so the demo keeps its payoff;
  the vouch still appears only *after* you send (causally earned) and backs the asker.
- Principle: **a spinner is a promise about duration.** Model an async wait as
  notifications that *arrive*, not motion that implies imminent completion. Wired in
  `components/IntroModal.tsx` only.

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
- **Warm-path edge gradient uses `userSpaceOnUse`, not the default `objectBoundingBox`**
  — an objectBoundingBox gradient is *ignored* by SVG on a zero-width/height shape, i.e.
  a perfectly vertical/horizontal edge (e.g. you → a contact at the top of the ring), so
  that one segment renders invisible while diagonal ones look fine. Anchoring the gradient
  to flow coordinates (±570 ≈ R2 + stagger) paints every segment and pans/zooms with it.
  (`components/graph/NetworkGraph.tsx`.)
- **Turbopack dev caches compiled CSS chunks** — a new rule added to `app/globals.css`
  mid-session can be missing from `next dev` *even after restarting it* (the prod build is
  fine). Symptom: the class is on the element but the rule isn't in the served sheet. Fix:
  `rm -rf .next` and restart dev. (Cost us a "why is this edge grey, not emerald" chase.)
- **Claude** drafts intros, with a deterministic template fallback (no key → template).
- Dark **Obsidian** theme.

## Bounty strategy
Target **Solvimon** ("most likely to be a successful business"). **Forwent** the Vercel
bounty (so we're not tied to Vercel). Skipped Codeplain/Sui/BGA/Bilt/FLock.

## Open / in-flight decisions
- **Sent-requests tab (SHIPPED):** a third left-panel tab (alongside Matches / Vouch
  requests) — the outbound mirror of the inbound "Vouch requests" inbox, completing the
  two-sided-on-one-account story (you *give* vouches AND track what you *send*). Lists
  intros you've sent with status (pending → connected → booked, or declined), **leads with
  the originating ask** (the context you'd forget), shows the recipient's one-line reply,
  and is a **resume point**: tap a connected card to reopen straight at booking. Carries
  the stats strip (vouch lift + funnel). State lifted into `app/page.tsx` (in-memory,
  demo-scoped); recorded on "Send request" in `IntroModal.tsx`.
  ⚠️ `app/page.tsx` edits stay clear of the parallel session's `runMatch` / `/api/match`
  lines — merge should be clean, but coordinate. Still do NOT touch the match path
  (`runMatch`, `lib/engine/match*`, `app/api/match`).
- **Client-side matching refactor** (Option A) — a parallel session is moving matching
  into the browser to fix the live Vercel `/api/match` 500. When it lands, its branch
  must be merged back into the working branch (disjoint files → clean merge).
- **Streaming intro draft** — only worth it if an `ANTHROPIC_API_KEY` is set (else the
  template is instant anyway).

## Run / verify (operational)
`npm run dev` → http://localhost:3000. Golden-path check: post the hero ask → Samuel #1
via Priya. For visual checks, a throwaway `playwright-core` driving the system Chrome
works (see how prior screenshots were taken). Keep `npm run build` green.
