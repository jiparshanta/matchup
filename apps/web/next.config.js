/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@matchup/shared'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

module.exports = nextConfig;
