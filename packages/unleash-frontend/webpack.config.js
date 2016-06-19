// docs: http://webpack.github.io/docs/configuration.html

'use strict';

const path = require('path');
const root = path.normalize(path.join(__dirname, '.'));
const jsroot = path.join(root, 'public', 'js');

module.exports = {

    context: jsroot,
    entry: './app.jsx',

    output: {
        path: path.join(root, 'public'),
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
