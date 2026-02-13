import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow serving images from /public/uploads (local)
    // and any external domains if needed later
    remotePatterns: [],
  },
};

export default nextConfig;
