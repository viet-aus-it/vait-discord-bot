/* eslint-disable import/extensions */
const path = require('node:path');
const CopyPlugin = require('copy-webpack-plugin');
const pkg = require('./package.json');
const tsconfigFile = require('./tsconfig.json');

const isProductionBuild = () => process.env.NODE_ENV === 'production';

const outputPath = path.resolve(__dirname, 'build');

const PRISMA_VERSION = pkg.dependencies['@prisma/client'];
const prismaClientPath = path.resolve(
  __dirname,
  'node_modules',
  `.pnpm/@prisma+client@${PRISMA_VERSION}_prisma@${PRISMA_VERSION}/node_modules`,
  '.prisma',
  'client'
);

/** @type import('webpack').Configuration */
const config = {
  mode: isProductionBuild() ? 'production' : 'development',
  target: 'node',
  devtool: isProductionBuild() ? 'eval-source-map' : 'source-map',
  entry: path.resolve(__dirname, 'src', 'index.ts'),
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    mainFields: ['main'],
    alias: {
      '.cows': 'cowsay/cows',
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /\.(test|config)\.ts$/,
        loader: 'esbuild-loader',
        options: {
          loader: 'ts',
          target: 'node16',
          tsconfigRaw: tsconfigFile,
        },
      },
    ],
  },
  externalsPresets: { node: true },
  externals: [
    'encoding',
    'erlpack',
    'bufferutil',
    'zlib-sync',
    'utf-8-validate',
    {
      _http_common: 'commonjs2 _http_common',
    },
  ],
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: prismaClientPath,
          to: path.resolve(outputPath, 'server'),
        },
        {
          from: path.resolve(prismaClientPath, 'schema.prisma'),
          to: path.resolve(outputPath, 'server'),
        },
        {
          from: path.resolve(
            __dirname,
            'node_modules',
            'cowsay',
            'cows',
            'default.cow'
          ),
          to: path.resolve(outputPath, './cows'),
        },
      ],
    }),
  ],
  output: {
    path: outputPath,
    filename: 'server/index.js',
  },
};

module.exports = config;
