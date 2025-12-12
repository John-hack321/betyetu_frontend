/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Optional: Disable TypeScript type checking during builds
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
