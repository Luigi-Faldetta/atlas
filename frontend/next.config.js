/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Or whatever other config you have
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
  // ... any other configurations you might have
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
