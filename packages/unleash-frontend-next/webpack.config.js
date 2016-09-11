// docs: http://webpack.github.io/docs/configuration.html

'use strict';

const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: [
        'webpack-dev-server/client?http://localhost:3000',
        'webpack/hot/only-dev-server',
        './src/index',
    ],

    resolve: {
        root: [path.join(__dirname, 'src')],
        extensions: ['', '.js', '.jsx'],
        modulesDirectories: ['web_modules', 'node_modules'],
    },

    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/static/',
    },

    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loaders: ['babel'],
                include: path.join(__dirname, 'src'),
            },
        ],
    },

    plugins: [
        new webpack.HotModuleReplacementPlugin(),
    ],

    devtool: 'source-map',

    externals: {
        // stuff not in node_modules can be resolved here.
    },

};
