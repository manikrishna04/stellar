import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Silences the error by acknowledging Turbopack
  experimental: {
    turbopack: {}, 
  },
  // 2. This will only run if you use the --webpack flag or build for production
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        cacheGroups: {
          default: false,
        },
      };
      config.optimization.runtimeChunk = false;
    }
    return config;
  },
};

export default nextConfig;