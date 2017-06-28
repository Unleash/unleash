'use strict';

const express = require('express');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const validator = require('express-validator');
const responseTime = require('response-time');
const log4js = require('log4js');
const logger = require('./logger');
const routes = require('./routes');
const path = require('path');
const errorHandler = require('errorhandler');

const { REQUEST_TIME } = require('./events');

module.exports = function(config) {
    const app = express();

    const baseUriPath = config.baseUriPath || '';
    const publicFolder = config.publicFolder;

    app.set('trust proxy');
    app.set('port', config.port);
    app.locals.baseUriPath = baseUriPath;

    if (typeof config.preHook === 'function') {
        config.preHook(app);
    }

    app.use(cookieParser());

    if (publicFolder) {
        app.use(favicon(path.join(publicFolder, 'favicon.ico')));
    }

    app.use(
        responseTime((req, res, time) => {
            const timingInfo = {
                path: req.path,
                method: req.method,
                statusCode: res.statusCode,
                time,
            };
            config.eventBus.emit(REQUEST_TIME, timingInfo);
        })
    );

    app.use(validator([]));

    if (publicFolder) {
        app.use(baseUriPath, express.static(publicFolder));
    }

    app.use(bodyParser.json({ strict: false }));

    if (config.enableRequestLogger) {
        app.use(
            log4js.connectLogger(logger, {
                format: ':status :method :url :response-timems',
                level: 'auto', // 3XX=WARN, 4xx/5xx=ERROR
            })
        );
    }

    if (typeof config.preRouterHook === 'function') {
        config.preRouterHook(app);
    }

    // Setup API routes
    const apiRouter = express.Router(); // eslint-disable-line new-cap
    routes.createAPI(apiRouter, config);
    app.use(`${baseUriPath}/api/`, apiRouter);

    // Setup deprecated routes
    const router = express.Router(); // eslint-disable-line new-cap
    routes.createLegacy(router, config);
    app.use(baseUriPath, router);

    if (process.env.NODE_ENV !== 'production') {
        app.use(errorHandler());
    }

    return app;
};
