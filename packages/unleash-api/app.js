'use strict';
const express = require('express');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const validator = require('express-validator');
const log4js = require('log4js');
const logger = require('./lib/logger');
const routes = require('./lib/routes');
const path = require('path');

module.exports = function(config) {
    const app = express();
    const router = express.Router();
    const baseUriPath  = config.baseUriPath || '';
    const publicFolder = config.publicFolder;

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
        level: 'auto', // 3XX=WARN, 4xx/5xx=ERROR
    }));

    // Setup API routes
    routes.create(router, config);
    app.use(baseUriPath, router);

    if (process.env.NODE_ENV !== 'production') {
        app.use(require('errorhandler')());
    }

    return app;
};
