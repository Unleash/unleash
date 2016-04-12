// docs: http://webpack.github.io/docs/configuration.html

var path = require('path');
var root = path.normalize(path.join(__dirname, '.'));
var jsroot = path.join(path.join(root, 'public'), 'js');

module.exports = {

    context: jsroot,
    entry: 'app',

    output: {
        path: jsroot,
        filename: 'bundle.js',
        publicPath: '/js/'
    },

    resolve: {
        root: [jsroot],
        extensions: ['', '.js', '.jsx'],
        modulesDirectories: ["web_modules", "node_modules"]
    },

    module: {
        loaders: [
            { test: /\.jsx$/, loader: 'jsx?harmony' }
        ]
    },

    devtool: "source-map",

    externals: {
        // stuff not in node_modules can be resolved here.
    }

};
