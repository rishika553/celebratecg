import type { NextConfig } from 'next';

const backendUrl = process.env.BACKEND_URL?.trim();

if (process.env.VERCEL && !backendUrl) {
  throw new Error(
    'Set BACKEND_URL to your Render HTTPS origin before deploying to Vercel.'
  );
}

const backend = new URL(backendUrl || 'http://127.0.0.1:8000');

if (
  !['http:', 'https:'].includes(backend.protocol) ||
  backend.username ||
  backend.password ||
  backend.pathname !== '/' ||
  backend.search ||
  backend.hash ||
  (process.env.VERCEL && backend.protocol !== 'https:')
) {
  throw new Error(
    'BACKEND_URL must be an origin without a path or credentials (HTTPS on Vercel).'
  );
}

const config: NextConfig = {
  poweredByHeader: false,

  async redirects() {
    return [
      {
        source: '/customer',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/vendor',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/services',
        destination: '/#services',
        permanent: true,
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backend.origin}/api/:path*`,
      },
    ];
  },
};

export default config;