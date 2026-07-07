import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  serverExternalPackages: ["pdf-parse", "tesseract.js", "sharp"],
};

export default nextConfig;
