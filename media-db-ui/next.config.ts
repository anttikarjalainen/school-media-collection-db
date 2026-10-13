import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Agent guidance lives in CLAUDE.md; stop `next dev` from generating AGENTS.md.
  agentRules: false,
  cacheComponents: true,
  partialPrefetching: true,
  async redirects() {
    return [{ source: "/", destination: "/books", permanent: false }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
