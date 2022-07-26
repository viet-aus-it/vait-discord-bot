import esbuild from 'esbuild';
import { copy } from 'esbuild-plugin-copy';
import path from 'node:path';
// eslint-disable-next-line import/extensions
import pkg from './package.json';

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

const cowPath = path.resolve(
  __dirname,
  'node_modules',
  'cowsay',
  'cows',
  'default.cow'
);

async function build() {
  try {
    console.log('Starting bundling by ESBuild...');
    const result = await esbuild.build({
      platform: 'node',
      target: 'node16',
      bundle: true,
      minify: false,
      entryPoints: [path.resolve(__dirname, 'src', 'index.ts')],
      outdir: path.resolve(outputPath, 'server'),
      sourcemap: isProductionBuild() ? 'both' : 'linked',
      tsconfig: 'tsconfig.json',
      external: [
        'encoding',
        'erlpack',
        'bufferutil',
        'zlib-sync',
        'utf-8-validate',
        'commonjs2 _http_common_',
      ],
      plugins: [
        copy({
          assets: [
            {
              from: path.resolve(prismaClientPath, 'libquery_engine-*'),
              to: '.',
            },
            {
              from: path.resolve(prismaClientPath, 'schema.prisma'),
              to: '.',
            },
          ],
        }),
        copy({
          resolveFrom: 'cwd',
          assets: [
            {
              from: cowPath,
              to: path.resolve(outputPath, 'cows'),
              keepStructure: true,
            },
          ],
        }),
      ],
    });

    console.log('Build complete', result);
  } catch (error) {
    console.error(error);
    process.exit();
  }
}

build();
