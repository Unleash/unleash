// docs: http://webpack.github.io/docs/configuration.html

'use strict';

const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    entry: [
        'webpack-dev-server/client?http://localhost:3000',
        'webpack/hot/only-dev-server',
        './src/index',
    ],

    resolve: {
        root: [path.join(__dirname, 'src')],
        extensions: ['', '.scss', '.css', '.js', '.jsx', '.json'],
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
            {
                test: /(\.scss|\.css)$/,
                loader: ExtractTextPlugin.extract('style', 'css?sourceMap&modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss!sass')
                
            },
        ],
    },

    plugins: [
        new ExtractTextPlugin('bundle.css',  { allChunks: true }),
        new webpack.HotModuleReplacementPlugin(),
    ],

    sassLoader: {
        data: '@import "theme/_config.scss";',
        includePaths: [path.resolve(__dirname, './src')]
    },

    devtool: 'source-map',

    toolbox: {theme: 'src/theme/_config.scss'},

    externals: {
        // stuff not in node_modules can be resolved here.
    },

};
