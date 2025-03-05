/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['restate-story.s3.ap-southeast-1.amazonaws.com'],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'restate-story.s3.ap-southeast-1.amazonaws.com',
        pathname: '**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
};

export default nextConfig;
