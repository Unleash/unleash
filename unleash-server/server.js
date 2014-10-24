var express     = require('express'),
    bodyParser  = require('body-parser'),
    log4js      = require('log4js'),
    logger      = require('./lib/logger'),
    routes      = require('./lib/routes'),
    eventApi    = require('./lib/eventApi'),
    featureApi  = require('./lib/featureApi'),
    validator   = require('express-validator'),
    app         = express(),
    router      = express.Router(),
    baseUriPath = process.env.BASE_URI_PATH || '';

if(app.get('env') === 'development') {
    app.use(require('errorhandler')());
}

app.use(validator([]));

app.set('trust proxy');
app.locals.baseUriPath = baseUriPath;

app.use(log4js.connectLogger(logger, {format: ':remote-addr :status :method :url :response-timems'}));
app.set('port', process.env.HTTP_PORT || 4242);

app.use(baseUriPath, express.static(__dirname + '/public'));
app.use(bodyParser.json({strict: false}));

eventApi(router);
featureApi(router);
routes(router);
app.use(baseUriPath, router);

var server = app.listen(app.get('port'), function() {
    logger.info('unleash started on ' + app.get('port'));
});

process.on('uncaughtException', function(err) {
    logger.error('Uncaught Exception:', err.message);
    logger.error(err.stack);
});


module.exports = {
    app: app,
    server: server
};