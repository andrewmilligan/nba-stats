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
  format: 'cjs',
  sourcemap: false,
  preserveModules: false,
};

export default [
  {
    input: 'src/task.js',
    output: [
      {
        file: 'handler_task.js',
        ...output,
      },
    ],
    plugins,
  },
  {
    input: 'src/scheduleTasks.js',
    output: [
      {
        file: 'handler_scheduleTasks.js',
        ...output,
      },
    ],
    plugins,
  },
];
