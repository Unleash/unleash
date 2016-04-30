var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var log4js = require('log4js');
var logger = require('./lib/logger');
var routes = require('./lib/routes');
var validator = require('express-validator');
var app = express();
var router = express.Router(); // eslint-disable-line
var baseUriPath  = process.env.BASE_URI_PATH || '';

if (app.get('env') === 'development') {
    app.use(require('errorhandler')());

    var webpack              = require('webpack'),
        webpackDevMiddleware = require('webpack-dev-middleware'),
        webpackConfig        = require('./webpack.config'),
        compiler             = webpack(webpackConfig),
        config               = {
            publicPath: '/js',
            noInfo: true
        };

    app.use(baseUriPath, webpackDevMiddleware(compiler, config));
}

app.use(validator([]));

app.set('trust proxy');
app.locals.baseUriPath = baseUriPath;

app.use(log4js.connectLogger(logger, {
    format: ':remote-addr :status :method :url :response-timems',
    level: 'auto' // 3XX=WARN, 4xx/5xx=ERROR
}));

app.set('port', process.env.HTTP_PORT || process.env.PORT || 4242);

app.use(baseUriPath, express.static(__dirname + '/public'));
app.use(bodyParser.json({ strict: false }));

app.use(cookieParser());

routes.create(router);

app.use(baseUriPath, router);

module.exports = app;
