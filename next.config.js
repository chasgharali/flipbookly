/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@napi-rs/canvas', 'pdfjs-dist'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      const path = require('path')
      // Point worker files to our stub
      config.resolve.alias = {
        ...config.resolve.alias,
        './pdf.worker.js': path.resolve(__dirname, 'lib/pdf.worker.stub.js'),
        'pdfjs-dist/build/pdf.worker.js': path.resolve(__dirname, 'lib/pdf.worker.stub.js'),
        'pdfjs-dist/legacy/build/pdf.worker.js': path.resolve(__dirname, 'lib/pdf.worker.stub.js'),
      }
    }
    return config
  },
}

module.exports = nextConfig

