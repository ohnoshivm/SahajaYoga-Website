import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // three / R3F ship ESM; transpile drei's examples-jsm imports cleanly
  transpilePackages: ["three"],
};

export default nextConfig;
