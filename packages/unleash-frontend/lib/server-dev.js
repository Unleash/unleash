'use strict';

const server = require('unleash-api');

const unleash = server.start({});
const app = unleash.app;
const config = unleash.config;

const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackConfig = require('./webpack.config');
const compiler = webpack(webpackConfig);

app.use(config.baseUriPath, webpackDevMiddleware(compiler, {
    publicPath: '/js',
    noInfo: true,
}));
