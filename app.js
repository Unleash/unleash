var express      = require('express'),
    bodyParser   = require('body-parser'),
    cookieParser = require('cookie-parser'),
    log4js       = require('log4js'),
    logger       = require('./lib/logger'),
    routes       = require('./lib/routes'),
    eventApi     = require('./lib/eventApi'),
    featureApi   = require('./lib/featureApi'),
    featureArchiveApi  = require('./lib/featureArchiveApi'),
    strategyApi  = require('./lib/strategyApi'),
    validator    = require('express-validator'),
    app          = express(),
    router       = express.Router(),
    baseUriPath  = process.env.BASE_URI_PATH || '';

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
app.use(bodyParser.json({strict: false}));

app.use(cookieParser());

eventApi(router);
featureApi(router);
featureArchiveApi(router);
strategyApi(router);
routes(router);
app.use(baseUriPath, router);

module.exports = app;
