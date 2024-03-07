import path from 'node:path';
import { defineConfig } from 'rollup';
import esbuild from 'rollup-plugin-esbuild';
import { nodeExternals } from 'rollup-plugin-node-externals';

const srcPath = path.resolve('src');

const outputPath = path.resolve('build');

export default defineConfig({
  input: [
    path.resolve(srcPath, 'index.ts'),
    path.resolve(srcPath, 'broadcast-reminder.ts'),
    path.resolve(srcPath, 'autobump.ts'),
    path.resolve(srcPath, 'cleanup-expired-referrals.ts'),
  ],
  output: {
    dir: path.resolve(outputPath),
    format: 'esm',
    entryFileNames: '[name].mjs',
  },
  plugins: [nodeExternals(), esbuild()],
});
