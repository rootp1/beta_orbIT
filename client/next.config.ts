import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow cross-origin requests from your ngrok domain
  allowedDevOrigins: [
    "allowedly-retractible-ladawn.ngrok-free.dev",
    // Add any other domains you use for development
    "localhost",
    "127.0.0.1"
  ],
  
  // Optional: Add other common configurations
  experimental: {
    // Enable if you're using any experimental features
  },
  
  // Webpack configuration for better compatibility
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

export default nextConfig;