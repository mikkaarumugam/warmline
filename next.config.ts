import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @huggingface/transformers pulls in onnxruntime-node, which ships a native
  // libonnxruntime.so. Turbopack won't bundle the .so, so on Vercel's
  // serverless runtime the import crashes ("cannot open shared object file").
  // Keep the package external so it's required from node_modules at runtime...
  serverExternalPackages: ["@huggingface/transformers"],
  // ...and force the native binary into the /api/match function's file trace.
  outputFileTracingIncludes: {
    "/api/match": ["./node_modules/onnxruntime-node/bin/**/*"],
  },
};

export default nextConfig;
