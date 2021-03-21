const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const pkg = require('./package.json');

const { name } = pkg;
const pathToEntry = './src/index.js';

module.exports = () => ({
    entry: {
        [`${name}.min`]: pathToEntry,
    },
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
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
            include: /\.min\.js$/,
            parallel: true,
        })],
    },
});
