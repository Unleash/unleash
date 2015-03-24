// docs: http://webpack.github.io/docs/configuration.html

var path = require('path');
var root = path.normalize(path.join(__dirname, '.'));
var js_root = path.join(path.join(root, 'public'), 'js');

module.exports = {

    context: js_root,
    entry: 'UnleashApp',

    output: {
        path: js_root,
        filename: 'bundle.js',
        publicPath: '/js/'
    },

    resolve: {
        root: [js_root],
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
