/* eslint-disable global-require, import/no-dynamic-require */
import path from 'path';
import { Configuration } from 'webpack';
import CopyPlugin from 'copy-webpack-plugin';
import NodemonPlugin from 'nodemon-webpack-plugin';

const isProductionBuild = () => process.env.NODE_ENV === 'production';

const outputPath = path.resolve(__dirname, 'build');

const prismaClientPath = path.resolve(
  __dirname,
  'node_modules',
  '.pnpm/@prisma+client@3.12.0_prisma@3.12.0/node_modules',
  '.prisma',
  'client'
);

const config: Configuration = {
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

export default config;
