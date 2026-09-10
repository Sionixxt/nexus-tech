/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output for deployment on Render / Docker
  output: 'standalone',

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Use unoptimized images on free tier (no sharp needed)
    unoptimized: process.env.NODE_ENV === 'production',
  },

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  },

  // Suppress hydration warnings in dev
  reactStrictMode: true,
};

module.exports = nextConfig;
