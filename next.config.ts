import withPWA from 'next-pwa';

const nextConfig = {
  // Disable ESLint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Optional: Disable TypeScript type checking during builds
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ensure proper routing
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

const withPWAConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest.json$/],
});

export default withPWAConfig(nextConfig);