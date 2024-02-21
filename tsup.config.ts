import path from 'node:path';
import { copy } from 'esbuild-plugin-copy';
import pino from 'esbuild-plugin-pino';
import { defineConfig } from 'tsup';
import pkg from './package.json';

const isProductionBuild = () => process.env.NODE_ENV === 'production';

const binPath = path.resolve(__dirname, 'bin');

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

const cowPath = path.resolve(__dirname, 'node_modules', 'cowsay', 'cows', 'default.cow');

export default defineConfig({
  platform: 'node',
  target: 'node22',
  bundle: true,
  minify: true,
  entry: [
    path.resolve(binPath, 'main.ts'),
    path.resolve(binPath, 'broadcast-reminder.ts'),
    path.resolve(binPath, 'autobump.ts'),
    path.resolve(binPath, 'cleanup-expired-referrals.ts'),
    path.resolve(binPath, 'tracing.ts'),
  ],
  outDir: path.resolve(outputPath, 'server'),
  format: ['cjs', 'esm'],
  dts: false,
  sourcemap: isProductionBuild() ? 'inline' : false,
  clean: true,
  plugins: [
    copy({
      verbose: true,
      assets: [
        {
          from: [path.join(prismaClientPath, 'libquery_engine-*'), path.join(prismaClientPath, 'schema.prisma')],
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
    pino({ transports: ['pino/file', '@axiomhq/pino'] }),
  ],
});
