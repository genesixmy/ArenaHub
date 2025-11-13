import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Force transpilation of packages that may not be fully compatible with React 19
  transpilePackages: ['react-hot-toast', 'lucide-react'],
  webpack: (config, { isServer }) => {
    // Fix for __webpack_require__.n is not a function error
    // This handles compatibility issues with React 19 and certain packages
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
};

export default nextConfig;
