const path = require('path');
const FractalWebpackPlugin = require('fractal-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const pkg = require('./package.json');

const { name, version } = pkg;

const pathToEntry = './src/examples/index.js';

module.exports = env => ({
    entry: {
        [`${name}.v${version}`]: pathToEntry,
        [`${name}.v${version}.min`]: pathToEntry,
        [`${name}.min`]: pathToEntry,
    },
    watch: env.fractalMode === 'server',
    output: {
        library: 'lucidSearch',
        libraryTarget: 'umd',
        filename: '[name].js',
        path: path.resolve(__dirname, 'src'),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'eslint-loader',
                enforce: 'pre',
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        new FractalWebpackPlugin({
            mode: env.fractalMode,
        }),
    ],
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
            include: /\.min\.js$/,
            parallel: true,
        })],
    },
});
