module.exports = {
  async rewrites() {
    return [
      {
        source: '/:slug(^[a-zA-Z0-9-]+$)',
        destination: '/profile/:slug'
      }
    ]
  }
}