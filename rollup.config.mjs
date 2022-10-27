import typescript from '@rollup/plugin-typescript';
import { babel } from '@rollup/plugin-babel';
import { terser } from "rollup-plugin-terser";

export default [
    // ES Modules
    {
        input: 'lib/index.ts',
        output: {
            file: 'bin/index.js',
            format: 'es',
        },
        plugins: [
            typescript(),
            babel({ extensions: ['.ts'] })
        ],
    },

    // UMD
    {
        input: 'lib/index.ts',
        output: {
            file: 'bin/index.umd.min.js',
            format: 'umd',
            name: 'js-https',
            indent: false,
        },
        plugins: [
            typescript(),
            babel({ extensions: ['.ts'], exclude: 'node_modules/**' }),
            terser(),
        ],
    },

    // CJS
    {
        input: 'lib/index.ts',
        output: {
            file: 'bin/index.cjs.js',
            format: 'cjs'
        },
        plugins: [
            typescript(),
            babel({ extensions: ['.ts']})
        ],
    },
]