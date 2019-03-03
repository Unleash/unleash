'use strict';

const express = require('express');
const compression = require('compression');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const IndexRouter = require('./routes');
const path = require('path');
const errorHandler = require('errorhandler');
const unleashSession = require('./middleware/session');
const responseTime = require('./middleware/response-time');
const requestLogger = require('./middleware/request-logger');
const simpleAuthentication = require('./middleware/simple-authentication');

module.exports = function(config) {
    const app = express();

    const baseUriPath = config.baseUriPath || '';

    app.set('trust proxy');
    app.disable('x-powered-by');
    app.set('port', config.port);
    app.locals.baseUriPath = baseUriPath;

    if (typeof config.preHook === 'function') {
        config.preHook(app);
    }

    app.use(compression());
    app.use(cookieParser());
    app.use(express.json({ strict: false }));
    app.use(unleashSession(config));
    app.use(responseTime(config));
    app.use(requestLogger(config));

    if (config.publicFolder) {
        app.use(favicon(path.join(config.publicFolder, 'favicon.ico')));
        app.use(baseUriPath, express.static(config.publicFolder));
    }

    if (config.adminAuthentication === 'unsecure') {
        simpleAuthentication(baseUriPath, app);
    }

    if (typeof config.preRouterHook === 'function') {
        config.preRouterHook(app);
    }

    // Setup API routes
    app.use(`${baseUriPath}/`, new IndexRouter(config).router);

    if (process.env.NODE_ENV !== 'production') {
        app.use(errorHandler());
    }

    return app;
};
