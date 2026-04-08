import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
      ignoreDuringBuilds: true,
  },
  typescript: {
      ignoreBuildErrors: true,
  },
  allowedDevOrigins: ['*.replit.dev', '*.janeway.replit.dev'],
};

export default nextConfig;
