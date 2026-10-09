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

const securityHeaders = [
  // Prevent clickjacking — satisfies Lighthouse "Mitigate clickjacking"
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Block MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Referrer
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // HSTS — Lighthouse: "Use a strong HSTS policy"
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // COOP — Lighthouse: "Ensure proper origin isolation with COOP"
  // same-origin-allow-popups keeps Google OAuth popup working
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
  // Disable unused browser features
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  // NOTE: CSP is intentionally omitted here.
  // Next.js requires 'unsafe-inline' in script-src (for __NEXT_DATA__ and route transitions).
  // Lighthouse 13 scores a CSP with 'unsafe-inline' as WORSE than no CSP — it blocks resources
  // AND fails the "effective against XSS" check. A nonce-based CSP via Next.js middleware is
  // the correct long-term approach once the app is stable.
];

const config: NextConfig = {
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },

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