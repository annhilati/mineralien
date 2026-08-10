import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Verhindert doppeltes Mounting von MapLibre (was DataCloneErrors bei ArrayBuffers auslöst)
  output: "export",
  images: {
    unoptimized: true, // Erforderlich für GitHub Pages (Static Export)
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.ya?ml$/,
      use: 'yaml-loader',
    });
    return config;
  },
};

export default nextConfig;
