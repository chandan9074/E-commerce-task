import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Catalogue imagery is served from a placeholder CDN; next/image still
    // handles resizing, AVIF/WebP negotiation and lazy loading.
    remotePatterns: [{ protocol: "https", hostname: "picsum.photos", pathname: "/**" }],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 828, 1080, 1200, 1920],
    imageSizes: [64, 96, 128, 200, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  experimental: {
    // Tree-shakes icon imports so a single icon never pulls in the whole pack.
    optimizePackageImports: ["react-icons"],
  },
  poweredByHeader: false,
};

export default nextConfig;
