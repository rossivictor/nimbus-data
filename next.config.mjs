import { existsSync, mkdirSync } from 'fs';

const puppeteerCacheDir = '/tmp/puppeteer_cache';
if (!existsSync(puppeteerCacheDir)) {
  mkdirSync(puppeteerCacheDir, { recursive: true });
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  webpack: (config) => {
    config.module.rules.push({
      test: /\.map$/,
      use: 'null-loader',
    });
    return config;
  },
};

export default nextConfig;