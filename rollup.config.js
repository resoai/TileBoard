import packageJson from './package.json';
import progress from 'rollup-plugin-progress';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-cpy';
import del from 'rollup-plugin-delete';
import emitEJS from 'rollup-plugin-emit-ejs';
import resolve from '@rollup/plugin-node-resolve';
import serve from 'rollup-plugin-serve';
import styles from 'rollup-plugin-styles';
import { terser } from 'rollup-plugin-terser';

const isProduction = process.env.PRODUCTION === 'true';
let outDir = 'build';
let outputJsName = ''
let outputCssName = ''
const appPlugins = [];

if (isProduction) {
   outputJsName = 'app-[hash].js'
   outputCssName = 'styles-[hash][extname]'
   appPlugins.push(terser());
}
else {
   outputJsName = 'app.js'
   outputCssName = 'styles[extname]'
   appPlugins.push(serve({
      contentBase: outDir,
      port: 8080,
   }));
}

/**  @type {import('rollup').RollupOptions} */
const config = {
   input: './scripts/index.js',
   output: {
      // Defines the output path of the extracted CSS.
      assetFileNames: `styles/${outputCssName}`,
      dir: outDir,
      entryFileNames: `scripts/${outputJsName}`,
      format: 'iife',
      globals: {
         '@babel/runtime/regenerator': 'regeneratorRuntime',
      },
      name: 'TileBoard',
      sourcemap: true,
   },
   plugins: [
      // Clean up output directory before building.
      del({
         targets: [
            `${outDir}/assets/`,
            `${outDir}/scripts/app*`,
            `${outDir}/styles/styles*`,
         ],
      }),
      progress(),
      commonjs(),
      resolve(),
      babel({
         babelHelpers: 'bundled',
         exclude: 'node_modules/**',
      }),
      styles({
         // Extract CSS into separate file (path specified through output.assetFileNames).
         mode: 'extract',
         // Don't try to resolve CSS @imports.
         import: false,
         sourceMap: true,
         url: {
            hash: 'assets/[name]-[hash][extname]',
            // The public path where assets referenced from css files are available.
            publicPath: '../assets/'
         },
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
         // Copy over empty custom.css but don't overwrite in case user has customized it.
         { files: './styles/custom.css', dest: `./${outDir}/styles/`, options: { overwrite: false } },
      ]),
      ...appPlugins,
   ],
};

export default config;
