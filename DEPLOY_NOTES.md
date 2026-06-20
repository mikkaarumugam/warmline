# Deploy notes — Warmline on Vercel

**Read this before touching matching, API routes, `next.config.ts`, or deploying.**

## TL;DR

- **Semantic matching runs CLIENT-SIDE now** (in the browser, WASM). The primary
  path is `lib/engine/match-client.ts`. The live site
  https://warmline-nu.vercel.app works; golden path holds (ask "a technical
  cofounder who knows payments infrastructure" → **Samuel Okoro #1 via Priya**),
  with **zero `/api/match` calls** on success.
- **`/api/match` is now a model-free *fallback* only** — a lightweight lexical
  overlap score. It no longer loads the embedding model. The page only calls it if
  the in-browser model fails to load.

## Deploying

- **The live site deploys from the `warmline` remote's `main` branch only.** To
  ship: `git push warmline HEAD:main` (auto-redeploys via Vercel's Git
  integration). A plain push to `origin` does **NOT** update the live site.
- Vercel only swaps the live site to a new deploy **if the build passes**. A failed
  build leaves the previous good deploy serving.

## Do NOT re-introduce the server-side model

`@huggingface/transformers` → `onnxruntime-node` is **~210 MB of native libs**.
Tracing it into a serverless function exceeds Vercel's **250 MB unzipped function
limit** and fails the build with `function_size_exceeded` (this already bit us
once).

- Do **not** import `@huggingface/transformers` (or `lib/engine/match.ts`, which
  imports it) from any API route / server module.
- `next.config.ts` uses `outputFileTracingExcludes` to keep
  `@huggingface/transformers` + `onnxruntime-node`/`-web` out of server function
  traces. **Leave that in.**
- Sanity check after a build: `find .next -name '*.nft.json' | xargs grep -l
  onnxruntime-node` should return **nothing** (native libs not traced into any
  function), while `.next/static` chunks still contain transformers (client OK).

## If you edit persona `offer` text in `data/seed/network.ts`

The client auto-re-embeds any offer whose text drifted from the precomputed
vector, so nothing breaks. But for the fast precomputed path, regenerate and
commit the JSON:

```
node scripts/precompute-embeddings.mjs   # rewrites data/seed/embeddings.json
git add data/seed/embeddings.json
```

## Files owned by the client-side-matching work

`lib/engine/match-client.ts` (new), `data/seed/embeddings.json` (new),
`scripts/precompute-embeddings.mjs` (new), `app/page.tsx` (`runMatch` + one-time
"loading model…" state), `app/api/match/route.ts` (model-free fallback),
`next.config.ts` (tracing excludes). The `MatchResult` contract (`lib/types.ts`)
and the UI are unchanged.
