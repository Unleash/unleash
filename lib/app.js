'use strict';

const express = require('express');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const validator = require('express-validator');
const responseTime = require('response-time');
const logger = require('./logger')('app.js');
const routes = require('./routes');
const path = require('path');
const errorHandler = require('errorhandler');

const { REQUEST_TIME } = require('./events');

module.exports = function(config) {
    const app = express();

    const baseUriPath = config.baseUriPath || '';
    const publicFolder = config.publicFolder;

    app.set('trust proxy');
    app.disable('x-powered-by');
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
                path: req.baseUrl,
                method: req.method,
                statusCode: res.statusCode,
                time,
            };
            config.eventBus.emit(REQUEST_TIME, timingInfo);
        })
    );

    app.use(
        validator({
            customValidators: {
                isUrlFirendlyName: input => encodeURIComponent(input) === input,
            },
        })
    );

    if (publicFolder) {
        app.use(baseUriPath, express.static(publicFolder));
    }

    app.use(bodyParser.json({ strict: false }));

    if (config.enableRequestLogger) {
        app.use((req, res, next) => {
            next();
            logger.info(`${res.statusCode} ${req.method} ${req.baseUrl}`);
        });
    }

    if (typeof config.preRouterHook === 'function') {
        config.preRouterHook(app);
    }

    // Setup API routes
    const middleware = routes.router(config);
    if (!middleware) {
        throw new Error('Routes invalid');
    }
    app.use(`${baseUriPath}/`, middleware);

    if (process.env.NODE_ENV !== 'production') {
        app.use(errorHandler());
    }

    return app;
};
