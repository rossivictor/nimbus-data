import { existsSync, mkdirSync } from 'fs';

const puppeteerCacheDir = '/tmp/puppeteer_cache';
if (!existsSync(puppeteerCacheDir)) {
  mkdirSync(puppeteerCacheDir, { recursive: true });
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
};

export default nextConfig;