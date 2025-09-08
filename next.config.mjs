/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false, // Enable ESLint for better code quality
  },
  typescript: {
    ignoreBuildErrors: false, // Enable TypeScript checking for better code quality
  },
  images: {
    unoptimized: false, // Enable image optimization for better performance
    domains: ['cut.ac.zw', 'lh3.googleusercontent.com'], // Add allowed domains
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
}

export default nextConfig
