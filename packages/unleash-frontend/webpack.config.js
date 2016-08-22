// docs: http://webpack.github.io/docs/configuration.html

'use strict';

const path = require('path');
const publicRoot = path.join(__dirname, 'public');
const jsroot = path.join(publicRoot, 'js');

module.exports = {

    context: jsroot,
    entry: './app.jsx',

    output: {
        path: publicRoot,
        filename: 'bundle.js',
        publicPath: '/js/',
    },

    resolve: {
        root: [jsroot],
        extensions: ['', '.js', '.jsx'],
        modulesDirectories: ['web_modules', 'node_modules'],
    },

    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel',
            },
        ],
    },

    devtool: 'source-map',

    externals: {
        // stuff not in node_modules can be resolved here.
    },

};
