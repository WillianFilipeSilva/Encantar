/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    optimizeCss: true,
  },
  output: 'standalone',
  generateBuildId: async () => 'build-' + Date.now(),
  trailingSlash: true,
}

module.exports = nextConfig