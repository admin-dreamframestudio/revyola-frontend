import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: isDev
        ? ["localhost:3000", "127.0.0.1:3000", "*.app.github.dev"]
        : [],
    },
  },
  allowedDevOrigins: isDev
    ? ["localhost:3000", "127.0.0.1:3000", "*.app.github.dev"]
    : [],
};

export default nextConfig;