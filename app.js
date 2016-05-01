var express = require('express');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var validator = require('express-validator');
var log4js = require('log4js');
var logger = require('./lib/logger');
var routes = require('./lib/routes');

module.exports = function(config) {
    var app = express();
    var router = express.Router(); // eslint-disable-line
    var baseUriPath  = config.baseUriPath || '';

    app.use(favicon(__dirname + '/public/favicon.ico'));

    app.use(validator([]));

    app.set('trust proxy');
    app.locals.baseUriPath = baseUriPath;

    app.use(log4js.connectLogger(logger, {
        format: ':remote-addr :status :method :url :response-timems',
        level: 'auto' // 3XX=WARN, 4xx/5xx=ERROR
    }));

    app.set('port', config.port);

    app.use(baseUriPath, express.static(__dirname + '/public'));
    app.use(bodyParser.json({ strict: false }));

    app.use(cookieParser());

    // Setup API routes
    routes.create(router, config);

    app.use(baseUriPath, router);

    return app;
};
