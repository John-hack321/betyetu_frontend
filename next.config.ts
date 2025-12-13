import withPWA from 'next-pwa';

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

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // Disable PWA in development
  ...nextConfig
});