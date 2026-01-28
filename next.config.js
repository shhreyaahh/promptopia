/* eslint-env node */
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
    domains: ['lh3.googleusercontent.com'],
  },
};

module.exports = nextConfig;
