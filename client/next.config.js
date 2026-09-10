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
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://nexustech-api-2zxm.onrender.com/api',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  },

  // Suppress hydration warnings in dev
  reactStrictMode: true,
};

module.exports = nextConfig;
