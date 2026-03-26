import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Quan trọng: để deploy lên Vercel
  output: 'standalone',

  // Thay images.domains bằng remotePatterns (bảo mật hơn)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
        pathname: '/ipfs/**',
      },
    ],
  },

  // Thêm turbopack config rỗng để chấp nhận Turbopack
  turbopack: {},
};

export default nextConfig;