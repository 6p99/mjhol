import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // FIX: removed "output: standalone" — Cloudflare Workers uses its own bundler
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  devIndicators: false,
};

export default nextConfig;
