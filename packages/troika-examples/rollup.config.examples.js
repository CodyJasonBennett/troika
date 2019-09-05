// Rollup plugins
import buble from 'rollup-plugin-buble'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import replace from 'rollup-plugin-replace'
import {string as importStrings} from 'rollup-plugin-string'
import importJson from 'rollup-plugin-json'
import css from 'rollup-plugin-postcss'
import serve from 'rollup-plugin-serve'


const { LERNA_PACKAGE_NAME, LERNA_ROOT_PATH, START_SERVER } = process.env
if (!LERNA_PACKAGE_NAME || !LERNA_ROOT_PATH) {
  throw new Error("The examples build must be run by Lerna; please use `npm run examples` from the repository root.")
}


export default {
  input: 'index.js',

  output: {
    format: 'iife',
    file: 'dist/examples-bundle.js'
  },

  plugins: [
    css({
      //output: 'dist/examples-bundle.css'
    }),
    importStrings({
      include: '**/*.glsl',
    }),
    importJson(),
    replace({
      'process.env.NODE_ENV': '"production"'
    }),
    buble(),
    commonjs({
      extensions: [ '.js', '.jsx' ],  // Default: [ '.js' ]
      namedExports: {
        // Help it resolve the exports from react
        'react': [
          'Component',
          'cloneElement'
        ],
        'react-color/lib/components/common': [
          'EditableInput',
          'ColorWrap',
          'Saturation',
          'Hue'
        ]
      }
    }),
    nodeResolve({
      // Favor our custom "module:es2015" field which points to the ES6 source files
      mainFields: ['module:es2015', 'module', 'jsnext:main', 'browser', 'main'],
    }),
    START_SERVER ? serve({
      //open: true,
      contentBase: ''
    }) : null
  ],

  onwarn(warning, warn) {
    // Quiet the 'Use of eval is strongly discouraged' warnings from Yoga lib
    // These are from the emscripten runtime so we can't do anything about them until Yoga
    // uses a newer versionof emscripten (https://github.com/kripken/emscripten/issues/5753)
    if (warning.code === 'EVAL' && /yoga\.factory\.js/.test(warning.id)) {
      return
    }
    warn(warning)
  }
}
