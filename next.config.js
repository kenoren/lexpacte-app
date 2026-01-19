/** @type {import('next').NextConfig} */
const nextConfig = {
  // Les Server Actions sont activées par défaut dans Next.js 14+
  webpack: (config) => {
    config.resolve = config.resolve || {}
    config.resolve.alias = config.resolve.alias || {}
    config.resolve.alias.canvas = false
    return config
  },
}

module.exports = nextConfig
