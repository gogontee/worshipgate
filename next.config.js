// next.config.js
module.exports = {
  experimental: {
    optimizePackageImports: [], // remove "lucide-react"
  },
  async rewrites() {
    return [
      {
        source: '/:slug(^[a-zA-Z0-9-]+$)',
        destination: '/profile/:slug',
      },
    ];
  },
};