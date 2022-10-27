import typescript from '@rollup/plugin-typescript';
import { babel } from '@rollup/plugin-babel';
// import { terser } from "rollup-plugin-terser";
// import { nodeResolve } from '@rollup/plugin-node-resolve';
// import commonjs from '@rollup/plugin-commonjs';

export default [
    // ES Modules
    {
        input: 'lib/index.ts',
        output: {
            file: 'bin/js-https.js',
            format: 'es',
        },
        plugins: [
            typescript(),
            babel({ extensions: ['.ts'] })
        ],
    },

    // // ES Modules Min
    // {
    //     input: 'lib/index-browser.ts',
    //     output: {
    //         file: 'bin/js-https.min.js',
    //         format: 'es',
    //     },
    //     plugins: [
    //         nodeResolve(),
    //         typescript(),
    //         commonjs(),
    //         babel({ extensions: ['.ts'], babelHelpers: 'bundled' }),
    //         terser()
    //     ],
    // },

    // UMD
    {
        input: 'lib/index.ts',
        output: {
            file: 'bin/js-https.umd.js',
            format: 'umd',
            name: 'js-https',
            indent: false,
        },
        plugins: [
            typescript(),
            babel({ extensions: ['.ts'] })
        ],
    },

    // CJS
    {
        input: 'lib/index.ts',
        output: {
            file: 'bin/js-https.cjs.js',
            format: 'cjs'
        },
        plugins: [
            typescript(),
            babel({ extensions: ['.ts']})
        ],
    },
]