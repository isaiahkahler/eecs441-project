/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['twemoji.maxcdn.com'],
  },
}

module.exports = nextConfig
