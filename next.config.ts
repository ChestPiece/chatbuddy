import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning mode: run ESLint during builds but don't fail on errors
    ignoreDuringBuilds: false,
    // Only report errors, not warnings
    dirs: ["src"],
  },
  typescript: {
    // Check TypeScript errors during production builds but don't fail
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
