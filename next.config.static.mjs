/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export için gerekli ayarlar
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  
  // Memory optimizasyonu
  swcMinify: false,
  compiler: {
    removeConsole: true,
  },
  
  // TypeScript ve ESLint check'lerini atla
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Image optimizasyonu kapat
  images: {
    unoptimized: true,
    loader: 'custom',
    loaderFile: './lib/image-loader.js'
  },
  
  // External packages
  serverExternalPackages: ['mysql2'],
  
  // Experimental optimizations
  experimental: {
    optimizeCss: false,
  },
  
  // Production için güvenlik
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
}

export default nextConfig
