var server = require('./server-impl');

var unleash = server.start({});
var app = unleash.app;
var config = unleash.config;

app.use(require('errorhandler')());

var webpack = require('webpack');
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpackConfig = require('./webpack.config');
var compiler = webpack(webpackConfig);

app.use(config.baseUriPath, webpackDevMiddleware(compiler, {
    publicPath: '/js',
    noInfo: true
}));
