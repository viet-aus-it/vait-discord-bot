import path from 'node:path';
import copy from 'rollup-plugin-copy';
import { defineConfig } from 'tsdown';

const isProductionBuild = () => process.env.NODE_ENV === 'production';

const binPath = path.resolve(__dirname, 'bin');

const outputPath = path.resolve(__dirname, 'build');

const prismaClientPath = path.resolve(__dirname, 'src', 'clients', 'prisma', 'generated', 'client');
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
  ],
  outDir: path.resolve(outputPath, 'server'),
  format: ['cjs', 'esm'],
  dts: false,
  sourcemap: isProductionBuild() ? 'inline' : false,
  clean: true,
  plugins: [
    copy({
      verbose: true,
      targets: [
        {
          src: [path.join(prismaClientPath, 'libquery_engine-*'), path.join(prismaClientPath, 'schema.prisma')],
          dest: [path.resolve(outputPath, 'server')],
        },
      ],
    }),
    copy({
      verbose: true,
      targets: [
        {
          src: [cowPath],
          dest: [path.resolve(outputPath, 'cows')],
        },
      ],
    }),
  ],
});
