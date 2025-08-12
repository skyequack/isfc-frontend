import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration for Azure Static Web Apps
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  },
  // Ensure trailing slashes for proper routing
  trailingSlash: true,
  // Optimize images for static hosting
  images: {
    unoptimized: true
  }
};

export default nextConfig;