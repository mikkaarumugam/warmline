# Warmline — Submission Details

*Paste-ready written explanation for the Checkpoint 1 form. Trim to the field's length limit.*

---

## One-liner
**Warmline is a two-sided, *declared* marketplace for warm introductions.** Everyone
declares an **offer** (how they can help) and an **ask** (what they need). Post an ask →
we semantically match it against others' declared offers across your 1st- and 2nd-degree
network → surface the **warm path** (You → mutual → target) → one-click draft the intro,
and the mutual **vouches** to back it.

## The problem
Warm intros convert up to **10x** better than cold outreach — they're how the best hires,
deals, and raises actually happen. Yet there's **no marketplace** for them. Every
incumbent (LinkedIn, Happenstance, The Swarm, Vieu) is **one-sided and inferred**: you
search, software guesses by scraping the other person's data, and the person on the other
end **never raised their hand**. The result is degree-based spam, not warm intros.

## Our wedge — two-sided + declared
Both sides opt in and **state intent**. Matching is on *declared* offers, not inferred
profiles, so a request only ever reaches someone who said they're open. Two structural
advantages fall out of this:
- **Consent is the anti-spam gate** — you can only reach people who declared they're open.
- **The shared mutual makes it warm** — every request rides on a real relationship.

## The core insight — the vouch is SIGNAL, not a GATE
The mutual **never blocks** an intro. They add a **1–10 confidence + note** that
*amplifies* it. The platform delivers your request to the target (who opted in), and the
mutual is pinged **in parallel** for an optional vouch — if they're silent, the request
still arrives, just without the endorsement. This kills the bottleneck that breaks every
warm-intro product (the busy gatekeeper) and keeps the marketplace **liquid**. The vouch
is a tap, so it actually gets done — and it drives ranking in the recipient's inbox.

**Evidence it works:** in our model, a request **with** a vouch is accepted **78%** of the
time vs **41%** without — a **~1.9x lift**. That single number is the thesis.

## What we built (working app)
Onboarding → semantic match → animated warm-path ego-graph → drafted intro → honest async
waiting states → vouch + accept → **zero-PII "book a call" handoff** → the accepted
connection **grows the live network graph**. Four surfaces complete the two-sided story on
one account: **Matches · Inbox · Sent · Vouches**. No in-app chat — we own the *intro and
the trust*, then hand off to email/calendar.

**Golden path (live):** ask *"a technical cofounder who knows payments infrastructure"* →
**Samuel Okoro** (ex-Adyen) ranks **#1 via Priya** — a *semantic* match with zero shared
keywords against "billing and ledger systems."

## How it's built
- **Local semantic embeddings** (transformers.js / MiniLM, no API key) — privacy +
  zero-setup. Runs **client-side in the browser (WASM)**, which is also a privacy upgrade
  and what makes it deployable serverless.
- **Warm-path BFS** (≤2 degrees) surfaces the route, not just a name.
- **Claude** drafts the intro (deterministic template fallback when no key is set).
- **No database** — a 94-person, 12-community seed graph; a reactive React Flow ego-graph.
- **Next.js 16 (Turbopack)**, deployed on **Vercel**.

## Process
Spine-first, then **three parallel agent tracks** against a frozen API contract (Engine ·
Frontend · Seed/Intro/Pitch) so work stayed merge-clean. Decisions and rationale are
captured in `DECISIONS.md`.

## Business — why this is a real company (Solvimon)
- **Customer:** founders, B2B sales/BD, recruiters — people whose job *is* warm intros.
- **Monetization (anchored, see `pitch/pricing.md`):** Free (acquisition) → **Pro $49/seat/mo**
  — deliberately *below* LinkedIn Sales Navigator ($99/mo), because warm + consented beats
  cold + inferred, and one landed intro pays for a year → **Community from ~$12k/yr**
  (accelerators, VC funds, alumni networks license it for members — recurring, the real
  revenue; they already promise warm intros by hand). Plus a **success fee** on booked
  **hire** intros — a fraction of a 15–25% recruiting-agency fee, meterable because we own
  the booking.
- **GTM:** grow the graph by **invites, never scraping** — sign in with LinkedIn for
  identity, invite people you actually know, every edge is consented. Cold-start
  **community-first** (one dense pocket → warm paths on day one); the vouch inbox is a
  built-in re-engagement loop.
- **Moat:** the consented, declared graph + the trust layer — a data network effect that
  competitors who *infer* structurally can't copy.

## Links
- **Live demo:** https://warmline-nu.vercel.app
- **Code:** https://github.com/mikkaarumugam/warmline
- **Deck:** `pitch/Warmline-deck.pdf`
- **Demo video:** *(add link after recording)*
