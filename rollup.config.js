import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';

const plugins = [
  json(),
  nodeResolve({
    preferBuiltins: true,
  }),
  commonjs(),
];

const output = {
  dir: 'deployment/dist',
  format: 'cjs',
  sourcemap: false,
  preserveModules: false,
};

export default [
  {
    input: 'src/task.js',
    output,
    plugins,
  },
  {
    input: 'src/scheduleTasks.js',
    output,
    plugins,
  },
];
