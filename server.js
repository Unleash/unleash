var logger = require('./lib/logger');

var config = {
    baseUriPath: process.env.BASE_URI_PATH || '',
    port: process.env.HTTP_PORT || process.env.PORT || 4242
};

var app = require('./app')(config);

var server = app.listen(app.get('port'), function() {
    logger.info('unleash started on ' + app.get('port'));
});

if (app.get('env') === 'development') {
    app.use(require('errorhandler')());

    var webpack = require('webpack');
    var webpackDevMiddleware = require('webpack-dev-middleware');
    var webpackConfig = require('./webpack.config');
    var compiler = webpack(webpackConfig);

    app.use(config.baseUriPath, webpackDevMiddleware(compiler, {
        publicPath: '/js',
        noInfo: true
    }));
}


process.on('uncaughtException', function(err) {
    logger.error('Uncaught Exception:', err.message);
    logger.error(err.stack);
});

module.exports = {
    app: app,
    server: server
};
