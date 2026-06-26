// next.config.mjs
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  
  webpack: (config, { isServer, webpack }) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    if (isServer) {
      config.output.webassemblyModuleFilename = './../static/wasm/[modulehash].wasm';

      // Prevent SSR from trying to bundle WASM-dependent packages
      const existingExternals = config.externals || [];
      config.externals = [
        ...(Array.isArray(existingExternals) ? existingExternals : [existingExternals]),
        '@meshsdk/core',
        '@meshsdk/react',
        '@meshsdk/core-cst',
        'sidan-csl-rs-browser',
        'sidan-csl-rs-node',
      ];

    } else {
      config.output.webassemblyModuleFilename = 'static/wasm/[modulehash].wasm';
      
      config.target = 'web';
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        async_hooks: false,
        stream: false,
        net: false,
        tls: false,
        http: false,
        https: false,
        zlib: false,
      };

      // Strip "node:" prefix so fallbacks above kick in using NormalModuleReplacementPlugin
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
          resource.request = resource.request.replace(/^node:/, '');
        })
      );
    }

    // Alias libsodium to CJS build
    config.resolve.alias = {
      ...config.resolve.alias,
      'libsodium-wrappers-sumo': path.resolve(
        __dirname,
        'node_modules/.pnpm/libsodium-wrappers-sumo@0.7.16/node_modules/libsodium-wrappers-sumo/dist/modules-sumo/libsodium-wrappers.js'
      ),
      'libsodium-sumo': path.resolve(
        __dirname,
        'node_modules/.pnpm/libsodium-sumo@0.7.16/node_modules/libsodium-sumo/dist/modules-sumo/libsodium-sumo.js'
      ),
    };

    config.module.rules.push(
      // Let webpack properly wrap the libsodium CJS file so require() works
      {
        test: /libsodium-(wrappers-)?sumo[/\\]dist[/\\]modules-sumo[/\\](libsodium-wrappers|libsodium-sumo)\.js$/,
        type: 'javascript/auto',
      },
      // Handle other .mjs files in node_modules
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      }
    );

    return config;
  },
};

export default nextConfig;