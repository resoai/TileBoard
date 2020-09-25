import packageJson from './package.json';
import progress from 'rollup-plugin-progress';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-cpy';
import del from 'rollup-plugin-delete';
import emitEJS from 'rollup-plugin-emit-ejs';
import less from 'rollup-plugin-less';
import resolve from '@rollup/plugin-node-resolve';
import serve from 'rollup-plugin-serve';
import { terser } from 'rollup-plugin-terser';

const isProduction = process.env.PRODUCTION === 'true';
let outDir = '';
const appPlugins = [];

if (isProduction) {
   outDir = 'dist';
   appPlugins.push(terser());
}
else {
   outDir = 'dist-dev';
   appPlugins.push(serve({
      contentBase: outDir,
      port: 8080,
   }));
}

/**  @type {import('rollup').RollupOptions} */
const config = {
   input: './scripts/index.js',
   output: {
      dir: outDir,
      entryFileNames: 'scripts/app.js',
      format: 'iife',
      globals: {
         '@babel/runtime/regenerator': 'regeneratorRuntime',
      },
      name: 'TileBoard',
      sourcemap: 'hidden',
   },
   plugins: [
      // Clean up output directory before building.
      del({
         targets: [`${outDir}/scripts/app.*`],
      }),
      progress(),
      commonjs(),
      resolve(),
      babel({
         'babelrc': false,
         babelHelpers: 'bundled',
         exclude: 'node_modules/**',
         plugins: [
            'angularjs-annotate',
         ],
      }),
      less({
         output: `${outDir}/styles/styles.css`,
      }),
      emitEJS({
         src: '.',
         data: {
            VERSION: packageJson.version,
         },
      }),
      copy([
         { files: './favicon.png', dest: `./${outDir}/` },
         { files: './manifest.webmanifest', dest: `./${outDir}/` },
         { files: './images/*.*', dest: `./${outDir}/images/` },
         { files: './styles/custom.css', dest: `./${outDir}/styles/`, options: { overwrite: false } },
      ]),
      ...appPlugins,
   ],
};

export default config;
