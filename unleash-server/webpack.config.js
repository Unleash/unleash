// docs: http://webpack.github.io/docs/configuration.html

module.exports = {

    context: __dirname + '/public',
    entry: './js/unleash',

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
            { test: /\.jsx$/, loader: 'jsx' }
        ]
    },

    externals: {
        // stuff not in node_modules can be resolved here.
    }

};