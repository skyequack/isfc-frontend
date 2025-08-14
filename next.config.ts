import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration for Azure Static Web Apps
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  },
  // Optimize images for static hosting
  images: {
    unoptimized: true
  },
  // Ensure proper handling of environment variables
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
  }
};

export default nextConfig;