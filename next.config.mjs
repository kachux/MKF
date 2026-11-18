/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.optimization.splitChunks = false;
      config.externals = [...(config.externals || []), "node:sqlite"];
    }
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ["node:sqlite", "better-sqlite3"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
