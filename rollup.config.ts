import path from 'node:path';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import swc from '@rollup/plugin-swc';
import { defineConfig } from 'rollup';
import copy from 'rollup-plugin-copy';
import esbuild from 'rollup-plugin-esbuild';
import { nodeExternals } from 'rollup-plugin-node-externals';
import pkg from './package.json' with { type: 'json' };

const isProductionBuild = () => process.env.NODE_ENV === 'production';

const srcPath = path.resolve('src');

const outputPath = path.resolve('build');

// Remove the '^' in '^a.b.c'
const PRISMA_VERSION = pkg.dependencies['@prisma/client'].substring(1);
const prismaClientPath = path.resolve(
  'node_modules',
  '.pnpm',
  `@prisma+client@${PRISMA_VERSION}_prisma@${PRISMA_VERSION}`,
  'node_modules',
  '.prisma',
  'client'
);

const cowPath = path.resolve('node_modules', 'cowsay', 'cows', 'default.cow');

export default defineConfig({
  input: [
    path.resolve(srcPath, 'index.ts'),
    path.resolve(srcPath, 'broadcast-reminder.ts'),
    path.resolve(srcPath, 'autobump.ts'),
    path.resolve(srcPath, 'cleanup-expired-referrals.ts'),
  ],
  output: {
    dir: path.resolve(outputPath, 'server'),
    format: 'esm',
    entryFileNames: '[name].mjs',
  },
  plugins: [
    nodeExternals({
      deps: false,
    }),
    swc(),
    copy({
      verbose: true,
      targets: [
        { src: path.join(prismaClientPath, 'libquery_engine-*'), dest: path.resolve(outputPath, 'server') },
        { src: path.join(prismaClientPath, 'schema.prisma'), dest: path.resolve(outputPath, 'server') },
        { src: cowPath, dest: path.resolve(outputPath, 'cows') },
      ],
    }),
  ],
});
