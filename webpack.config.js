const path = require('node:path');
const CopyPlugin = require('copy-webpack-plugin');
const NodemonPlugin = require('nodemon-webpack-plugin');

const isProductionBuild = () => process.env.NODE_ENV === 'production';

const outputPath = path.resolve(__dirname, 'build');

const PRISMA_VERSION = '3.14.0';
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
        loader: 'swc-loader',
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
    new NodemonPlugin({
      script: path.resolve(__dirname, 'build', 'server', 'index.js'),
      nodeArgs: ['--enable-source-maps'],
      watch: [
        path.resolve(__dirname, 'build'),
        path.resolve(__dirname, 'config.json'),
      ],
      ext: 'js',
      ignore: ['.git', 'node_modules', 'coverage', 'db'],
      verbose: true,
      delay: 1000,
    }),
  ],
  output: {
    path: outputPath,
    filename: 'server/index.js',
  },
};

module.exports = config;
