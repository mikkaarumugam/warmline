# Submission Requirements & Checklist

**Event:** Encode Vibe Coding Hackathon
**Deadline:** Sunday, **June 21, 2026, 12:00 PM (Europe/London)** — Checkpoint 1 *and* Final.
**Target bounties:** Solvimon ("most likely to be a successful business") · Vercel ("best use of Vercel").
**Working name:** Warmline *(confirm — backups: Vouch, Conduit)*.

> This is the source of truth for what we must deliver to submit. Keep the status boxes current.

## Final submission — 4 required links
| # | Field | What it is | Our plan | Status |
|---|-------|-----------|----------|--------|
| 1 | **Link to Code** | Public GitHub repo | Push this repo public; strong README | ☐ repo not pushed yet |
| 2 | **Link to Presentation** | Deck (Google Slides / Canva / DocSend) | Build from `pitch/deck.md` → hosted slides | ☐ deck source only |
| 3 | **Link to Demo Video** | Video (YouTube/Loom) of the demo | Record the golden-path walkthrough after deploy | ☐ not recorded |
| 4 | **Live Demo Link** | Deployed app (Vercel/Netlify) | `npx vercel` deploy → prod URL | ☐ needs Vercel login |

## Checkpoint 1 submission (separate form)
- ☐ **Submission Details** (required): written explanation — what we built, the process (spine-first + 3 parallel agent tracks), the two-sided/declared wedge, the tech (local embeddings, warm-path BFS, Claude intros).
- ☐ **Submission Files** (required, ≤25 MB): e.g. screenshots of the app + the deck PDF.

## What's DONE (the product itself)
- ✅ Working app: onboarding → semantic match → animated warm-path ego-graph → Claude/template intro.
- ✅ Semantic engine (local transformers.js, no key), 94-persona seed, golden path robust (Samuel #1 via Priya).
- ✅ Build green; runs locally at `http://localhost:3000`.

## Blockers to close (need from the user)
- ☐ **Name** confirmed (threads into UI header + onboarding + deck).
- ☐ **Vercel login** (`npx vercel login`) → unblocks Live Demo Link.
- ☐ **Anthropic API key** → turns "Draft intro" from template to live Claude (optional but stronger demo).

## Owner map (so parallel sessions don't collide)
- **This session:** `components/graph/*`, `app/page.tsx` (name/header), Vercel deploy, wiring key + name.
- **Parallel — Deck:** `pitch/*` only → produces the **Presentation** link.
- **Parallel — Repo/README:** `README.md`, `public/` assets → supports the **Code** link.
- **After deploy:** record the **Demo Video** (golden-path run on the live URL); keep a local backup recording.
