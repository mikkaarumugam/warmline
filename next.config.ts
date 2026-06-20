import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Semantic matching now runs CLIENT-SIDE (lib/engine/match-client.ts), where
  // @huggingface/transformers uses its WASM backend (onnxruntime-web) — no native
  // library. The browser dynamic-imports the package, but Next's server file
  // tracing would otherwise follow that import and pull the NODE variant
  // (onnxruntime-node ships ~210 MB of native libs) into the serverless function
  // bundles, blowing past Vercel's 250 MB unzipped function limit. Nothing runs
  // the model server-side anymore (/api/match is a model-free lexical fallback),
  // so exclude these from every server function trace.
  outputFileTracingExcludes: {
    "*": [
      "node_modules/@huggingface/transformers/**",
      "node_modules/onnxruntime-node/**",
      "node_modules/onnxruntime-web/**",
      "node_modules/sharp/**",
    ],
  },
};

export default nextConfig;
