import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Permite uploads de até 6MB nas API routes
  experimental: {
    serverActions: {
      bodySizeLimit: '6mb',
    },
  },
};

export default nextConfig;
