/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow ngrok domains in development
  allowedDevOrigins: [
    '*.ngrok-free.app',
    '*.ngrok.io'
  ],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        // Silently handle Clerk-related requests
        {
          source: '/.identity/:path*',
          destination: '/api/no-auth'
        }
      ]
    }
  },
  images: {
    domains: ['uploadthing.com', 'utfs.io'],
  },
  // Development origins
  experimental: {
    allowedDevOrigins: ['*.ngrok-free.app', '*.ngrok.io'],
  }
};

module.exports = nextConfig; 