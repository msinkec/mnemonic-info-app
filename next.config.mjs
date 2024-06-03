/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/mnemonic-info-app',
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        os: false,
        path: false,
        module: false
      }
    }
    return config;
  }
};

export default nextConfig;
