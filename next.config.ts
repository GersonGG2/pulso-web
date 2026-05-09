import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.pulsogg.gg' },
      { protocol: 'https', hostname: 'img.clerk.com' },
      { protocol: 'https', hostname: 'raw.communitydragon.org' },
      { protocol: 'https', hostname: 'ddragon.leagueoflegends.com' },
    ],
  },
};

export default nextConfig;
