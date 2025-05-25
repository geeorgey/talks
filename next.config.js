/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'docs',
  images: {
    unoptimized: true
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/talks' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/talks' : '',
  experimental: {
    appDir: true
  }
}

module.exports = nextConfig