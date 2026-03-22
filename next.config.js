/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow importing SVGs and other assets
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Strict mode for catching React issues early
  reactStrictMode: true,
};

module.exports = nextConfig;
