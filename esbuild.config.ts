import esbuild from 'esbuild';
import { copy } from 'esbuild-plugin-copy';
import path from 'node:path';
import pkg from './package.json';

const isProductionBuild = () => process.env.NODE_ENV === 'production';

const srcPath = path.resolve(__dirname, 'src');

const outputPath = path.resolve(__dirname, 'build');

// Remove the '^' in '^a.b.c'
const PRISMA_VERSION = pkg.dependencies['@prisma/client'].substring(1);
const prismaClientPath = path.resolve(
  __dirname,
  'node_modules',
  '.pnpm',
  `@prisma+client@${PRISMA_VERSION}_prisma@${PRISMA_VERSION}`,
  'node_modules',
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
      target: 'node20',
      bundle: true,
      minify: false,
      entryPoints: [
        path.resolve(srcPath, 'index.ts'),
        path.resolve(srcPath, 'broadcast-reminder.ts'),
        path.resolve(srcPath, 'autobump.ts'),
        path.resolve(srcPath, 'cleanup-expired-referrals.ts'),
      ],
      outdir: path.resolve(outputPath, 'server'),
      sourcemap: isProductionBuild() ? 'both' : 'linked',
      tsconfig: 'tsconfig.json',
      external: ['encoding', 'commonjs2 _http_common_'],
      plugins: [
        copy({
          verbose: true,
          assets: [
            {
              from: [
                path.join(prismaClientPath, 'libquery_engine-*'),
                path.join(prismaClientPath, 'schema.prisma'),
              ],
              to: ['.'],
            },
          ],
        }),
        copy({
          resolveFrom: 'cwd',
          verbose: true,
          assets: [
            {
              from: [cowPath],
              to: [path.resolve(outputPath, 'cows')],
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
