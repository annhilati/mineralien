import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true, // Erforderlich für GitHub Pages (Static Export)
  },
};

export default nextConfig;
