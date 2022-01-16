import path from 'path';
import { Configuration } from 'webpack';
import CopyPlugin from 'copy-webpack-plugin';

const isProductionBuild = () => process.env.NODE_ENV === 'production';

const tsconfigFile = isProductionBuild()
  ? 'tsconfig.json'
  : 'tsconfig.build.json';

const outputPath = path.resolve(__dirname, 'build');

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
        loader: 'ts-loader',
        options: {
          configFile: tsconfigFile,
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
          from: path.resolve(
            __dirname,
            'node_modules',
            '.prisma',
            'client',
            'libquery_engine-debian-openssl-1.1.x.so.node'
          ),
          to: outputPath,
        },
        {
          from: path.resolve(
            __dirname,
            'node_modules',
            '.prisma',
            'client',
            'schema.prisma'
          ),
          to: outputPath,
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

export default config;
