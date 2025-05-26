/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
    // Removing esmExternals as it's not recommended
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
      // Add other hostnames here if needed in the future
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    // Adding Clerk environment variables
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_aW1tdW5lLW1hZ2dvdC02OC5jbGVyay5hY2NvdW50cy5kZXYk',
    CLERK_SECRET_KEY: 'sk_test_svyAlbynCEIlll0g5a19TPJuG6Cn7XSJ1ARFh6JMD5',
    NEXT_PUBLIC_MCP_API_URL: process.env.NEXT_PUBLIC_MCP_API_URL || 'http://localhost:3001/api/v1',
  },
  // Transpile specific packages if needed
  transpilePackages: ['chart.js', 'recharts'],
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
