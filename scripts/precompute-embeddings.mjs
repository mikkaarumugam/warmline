// ─────────────────────────────────────────────────────────────────────────────
// Precompute persona-offer embeddings for CLIENT-SIDE semantic matching.
//
// The browser match module (lib/engine/match-client.ts) embeds only the live ASK
// at runtime and cosine-compares it against these precomputed, L2-normalized
// persona-OFFER vectors — so it never has to run the model over the whole graph
// in the browser, and Vercel never has to load the native onnxruntime .so.
//
// This is a BUILD-TIME script. It uses the SAME model + pooling + normalization
// as the server engine (lib/engine/match.ts) so client and server scores match.
// Run once and commit the JSON:  node scripts/precompute-embeddings.mjs
//
// Node ≥22 strips TS types, so we import the .ts seed directly; network.ts's only
// other import is `import type ... from "@/lib/types"`, which is erased at runtime
// (no path-alias resolution needed).
// ─────────────────────────────────────────────────────────────────────────────

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { pipeline } from "@huggingface/transformers";
import { NETWORK } from "../data/seed/network.ts";

const MODEL_ID = "Xenova/all-MiniLM-L6-v2";
const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "data", "seed", "embeddings.json");

// Round to 6 significant figures to shrink the shipped JSON without meaningfully
// changing cosine similarity (these are unit vectors, components are tiny).
const round6 = (x) => Number(x.toPrecision(6));

async function main() {
  console.log(`Loading model ${MODEL_ID}…`);
  const embedder = await pipeline("feature-extraction", MODEL_ID);

  const vectors = {};
  let dim = 0;
  for (const persona of NETWORK.personas) {
    const out = await embedder(persona.offer, {
      pooling: "mean",
      normalize: true,
    });
    const vec = Array.from(out.data, round6);
    dim = vec.length;
    vectors[persona.id] = { offer: persona.offer, vec };
    console.log(`  embedded ${persona.id} (${persona.name})`);
  }

  const payload = { model: MODEL_ID, dim, vectors };
  writeFileSync(OUT, JSON.stringify(payload));
  console.log(
    `\nWrote ${Object.keys(vectors).length} vectors (dim ${dim}) → ${OUT}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
