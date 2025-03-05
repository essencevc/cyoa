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
  },
};

export default nextConfig;
