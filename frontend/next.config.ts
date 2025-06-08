import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['@heroicons/react']
  },
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
  },
  // Enable strict mode for better development experience
  reactStrictMode: true,
  // Optimize images
  images: {
    domains: ['ui-avatars.com'],
  },
};

export default nextConfig;
