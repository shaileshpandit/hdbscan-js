import node from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import { uglify } from 'rollup-plugin-uglify'

function minify() {
  return uglify();
}

function config({ plugins = [], output = {} }) {
  return {
    input: 'src/index.ts',
    plugins: [
      typescript({ tsconfigOverride: { compilerOptions: { module: 'ES2015' } } }),
      node(), ...plugins
    ],
    output: {
      globals: {
      },
      ...output,
    },
    external: [
    ]
  };
}

export default [
  config({
    plugins: [minify()],
    output: { format: 'umd', name: 'hdbscan', file: 'dist/hdbscan.min.js' }
  }),
  config({
    plugins: [minify()],
    output: { format: 'es', file: 'dist/hdbscan.esm.js' }
  })
];
