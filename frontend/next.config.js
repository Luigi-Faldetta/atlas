/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
    taint: true, // Enable experimental taint API for additional security
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.*.dev https://*.clerk.accounts.dev https://challenges.cloudflare.com https://api.clerk.dev",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://clerk.*.dev https://*.clerk.accounts.dev",
              "font-src 'self' https://fonts.gstatic.com https://clerk.*.dev https://*.clerk.accounts.dev",
              "img-src 'self' data: https: https://images.unsplash.com https://img.clerk.com https://*.clerk.dev",
              "connect-src 'self' https://api.clerk.dev https://clerk.*.dev https://*.clerk.accounts.dev https://challenges.cloudflare.com wss://*.clerk.accounts.dev",
              "frame-src 'self' https://challenges.cloudflare.com https://clerk.*.dev https://*.clerk.accounts.dev",
              "worker-src 'self' blob:",
              "form-action 'self'",
              "base-uri 'self'",
              "object-src 'none'",
              "frame-ancestors 'none'"
            ].join('; ')
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), screen-wake-lock=()'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ]
  },
  // Prevent module not found issues
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**', // Allow any path on this hostname
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        port: '',
        pathname: '/**',
      },
      // Add other hostnames here if needed in the future
    ],
    // Security: Limit image domains and disable dangerous loaders
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001',
    // Adding Clerk environment variables
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_aW1tdW5lLW1hZ2dvdC02OC5jbGVyay5hY2NvdW50cy5kZXYk',
    CLERK_SECRET_KEY: 'sk_test_svyAlbynCEIlll0g5a19TPJuG6Cn7XSJ1ARFh6JMD5',
    NEXT_PUBLIC_MCP_API_URL: process.env.NEXT_PUBLIC_MCP_API_URL || 'http://localhost:3001/api/v1',
  },
  // Transpile specific packages if needed
  transpilePackages: ['chart.js', 'recharts'],
  // Security: Disable powered by header
  poweredByHeader: false,
  // Security: Enable compression
  compress: true,
  // Security: Strict mode for better debugging
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;

// OR if using ES Modules (next.config.mjs):
// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'images.unsplash.com',
//         port: '',
//         pathname: '/**',
//       },
//     ],
//   },
// };
// export default nextConfig;
