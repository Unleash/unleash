// docs: http://webpack.github.io/docs/configuration.html

module.exports = {

    context: __dirname + '/public',
    entry: './js/app',

    output: {
        path: __dirname + '/public/js',
        filename: 'bundle.js',
        publicPath: '/js/'
    },

    resolve: {
        extensions: ['', '.js', '.jsx']
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