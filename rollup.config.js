import typescript from 'rollup-plugin-typescript2'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
      },
      {
        file: pkg.module,
        format: 'es',
      },
    ],
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
    plugins: [
      typescript({
        typescript: require('typescript'), // eslint-disable-line
      }),
      commonjs(),
      resolve(),
      terser(),
    ],
  },
  {
    input: 'src/index.ts',
    external: ['react', 'hoist-non-react-statics', 'symbol-observable'],
    output: {
      name: 'ReactFirebaseSubscribable',
      file: pkg.browser,
      format: 'umd',
      globals: {
        'symbol-observable': 'Symbol.observable',
        react: 'React',
        'hoist-non-react-statics': 'hoistNonReactStatics',
      },
    },
    plugins: [
      typescript({
        typescript: require('typescript'), // eslint-disable-line
      }),
      commonjs(),
      resolve(),
      terser(),
    ]
  },
]
