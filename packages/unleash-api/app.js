var express = require('express');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var validator = require('express-validator');
var log4js = require('log4js');
var logger = require('./lib/logger');
var routes = require('./lib/routes');
var path = require('path');

module.exports = function(config) {
    var app = express();
    var router = express.Router();
    var baseUriPath  = config.baseUriPath || '';
    var publicFolder = config.publicFolder;

    app.set('trust proxy');
    app.set('port', config.port);
    app.locals.baseUriPath = baseUriPath;
    app.use(cookieParser());

    if (publicFolder) {
        app.use(favicon(path.join(publicFolder, 'favicon.ico')));
    }

    app.use(validator([]));
    if (publicFolder) {
        app.use(baseUriPath, express.static(publicFolder));
    }

    app.use(bodyParser.json({ strict: false }));
    app.use(log4js.connectLogger(logger, {
        format: ':remote-addr :status :method :url :response-timems',
        level: 'auto' // 3XX=WARN, 4xx/5xx=ERROR
    }));

    // Setup API routes
    routes.create(router, config);
    app.use(baseUriPath, router);

    if (process.env.NODE_ENV !== 'production') {
        app.use(require('errorhandler')());
    }

    return app;
};
