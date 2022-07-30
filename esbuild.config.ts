import esbuild from 'esbuild';
import { esbuildPluginNodeExternals as nodeExternals } from 'esbuild-plugin-node-externals';
import path from 'node:path';

const isProductionBuild = () => process.env.NODE_ENV === 'production';

const outputPath = path.resolve(__dirname, 'build');

async function build() {
  try {
    console.log('Starting bundling by ESBuild...');
    const result = await esbuild.build({
      platform: 'node',
      target: 'node16',
      bundle: true,
      minify: true,
      entryPoints: [path.resolve(__dirname, 'src', 'index.ts')],
      outdir: path.resolve(outputPath, 'server'),
      sourcemap: isProductionBuild() ? 'both' : 'linked',
      tsconfig: 'tsconfig.json',
      plugins: [nodeExternals()],
    });

    console.log('Build complete', result);
  } catch (error) {
    console.error(error);
    process.exit();
  }
}

build();
