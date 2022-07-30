import esbuild from 'esbuild';
import { copy } from 'esbuild-plugin-copy';
import path from 'node:path';
import url from 'node:url';
// eslint-disable-next-line import/extensions
import pkg from './package.json';

const dirname = url.fileURLToPath(new URL('.', import.meta.url));
const isProductionBuild = () => process.env.NODE_ENV === 'production';
const outputPath = path.resolve(dirname, 'build');

// Remove the '^' in '^a.b.c'
const PRISMA_VERSION = pkg.dependencies['@prisma/client'].substring(1);
const prismaClientPath = path.resolve(
  dirname,
  'node_modules',
  '.pnpm',
  `@prisma+client@${PRISMA_VERSION}_prisma@${PRISMA_VERSION}`,
  'node_modules',
  '.prisma',
  'client'
);

const cowPath = path.resolve(
  dirname,
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
      target: 'es2020',
      format: 'esm',
      bundle: true,
      minify: false,
      entryPoints: [path.resolve(dirname, 'src', 'index.ts')],
      outdir: path.resolve(outputPath, 'server'),
      sourcemap: isProductionBuild() ? 'both' : 'linked',
      banner: {
        js: "import { createRequire } from 'node:module';import url from 'node:url';const require = createRequire(import.meta.url);const __dirname = url.fileURLToPath(new URL('.', import.meta.url));const __filename = url.fileURLToPath(import.meta.url);",
      },
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
