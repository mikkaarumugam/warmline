# Submission Requirements & Checklist

**Event:** Encode Vibe Coding Hackathon
**Deadline:** Sunday, **June 21, 2026, 12:00 PM (Europe/London)** — Checkpoint 1 *and* Final.
**Target bounties:** Solvimon ("most likely to be a successful business") · Vercel ("best use of Vercel").
**Working name:** Warmline *(confirm — backups: Vouch, Conduit)*.

> This is the source of truth for what we must deliver to submit. Keep the status boxes current.

## Final submission — 4 required links
| # | Field | What it is | Link / artifact | Status |
|---|-------|-----------|----------------|--------|
| 1 | **Link to Code** | Public GitHub repo | https://github.com/mikkaarumugam/warmline | ✅ **public & in sync** |
| 2 | **Link to Presentation** | Deck | `pitch/Warmline-deck.pdf` (9 slides, business slides added) | ✅ built — host as a link (see below) |
| 3 | **Link to Demo Video** | Video (YouTube/Loom) | Golden-path walkthrough on the live URL | ☐ **record (only thing left)** |
| 4 | **Live Demo Link** | Deployed app | https://warmline-nu.vercel.app | ✅ **live & verified** (golden path holds in-browser, 0 errors) |

> **Presentation link options:** upload `pitch/Warmline-deck.pdf` to Google Slides/Drive
> (share-link), DocSend, or just link the PDF in the public repo. No re-design needed.

## Checkpoint 1 submission (separate form)
- ✅ **Submission Details** (required): written, paste-ready → `pitch/submission-details.md`.
- ✅ **Submission Files** (required, ≤25 MB): `pitch/submission-screenshots/` (6 PNGs, ~1.9 MB)
  + `pitch/Warmline-deck.pdf` (~96 KB). Total ~2 MB.

## What's DONE (the product itself)
- ✅ Working app: onboarding → semantic match → animated warm-path ego-graph → Claude/template intro.
- ✅ Semantic engine (local transformers.js, no key), 94-persona seed, golden path robust (Samuel #1 via Priya).
- ✅ Build green; runs locally at `http://localhost:3000`.

## Blockers to close (need from the user)
- ✅ **Name** — "Warmline" (used throughout app + deck; treat as confirmed).
- ✅ **Live Demo Link** — already deployed at https://warmline-nu.vercel.app (no Vercel
  login needed; redeploys on push to `origin/main`).
- ☐ **Record the demo video** — the one real remaining task. Pre-warm the match model
  (run one match first — there's a one-time WASM model load) before recording.
- ☐ **Host the deck** as a shareable link (PDF is ready in `pitch/`).
- ☐ *(optional)* **Anthropic API key** in `.env.local` → live Claude intros instead of the
  template. The template is coherent; this is a nice-to-have, not required.

## Owner map (so parallel sessions don't collide)
- **This session:** `components/graph/*`, `app/page.tsx` (name/header), Vercel deploy, wiring key + name.
- **Parallel — Deck:** `pitch/*` only → produces the **Presentation** link.
- **Parallel — Repo/README:** `README.md`, `public/` assets → supports the **Code** link.
- **After deploy:** record the **Demo Video** (golden-path run on the live URL); keep a local backup recording.
