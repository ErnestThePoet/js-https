import typescript from '@rollup/plugin-typescript';
import { babel } from '@rollup/plugin-babel';
import { terser } from "rollup-plugin-terser";
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

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
            babel({ extensions: ['.ts', '.js'] })
        ],
    },

    // UMD
    {
        input: 'lib/index.ts',
        output: {
            file: 'dist/js-https.min.js',
            format: 'umd',
            name: 'JsHttps',
            indent: false,
        },
        plugins: [
            nodeResolve({ browser: true }),
            babel({
                extensions: ['.ts', '.js'],
                presets: ['@babel/preset-env'] // ensure ES5
            }),
            typescript({ declaration: false }),
            commonjs(),
            terser()
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
            babel({ extensions: ['.ts', '.js'] })
        ],
    },
]