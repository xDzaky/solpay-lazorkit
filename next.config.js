/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Webpack configuration for Solana compatibility
  webpack: (config, { isServer }) => {
    // Polyfill for Node.js globals in browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer/'),
        process: require.resolve('process/browser'),
      };
      
      // Define global and process for browser
      const webpack = require('webpack');
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        }),
        new webpack.DefinePlugin({
          'process.env': JSON.stringify(process.env),
          global: 'globalThis',
        })
      );
    }

    // Ignore specific modules that cause issues
    config.externals.push("pino-pretty", "lokijs", "encoding");

    return config;
  },

  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_APP_NAME: "SolPay",
    NEXT_PUBLIC_APP_DESCRIPTION:
      "Subscription payments powered by Lazorkit passkey smart wallets",
  },

  // Experimental features
  experimental: {
    // Enable server actions for form handling
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },

  // Headers for security
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
