const express = require('express');

const compression = require('compression');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const path = require('path');
const errorHandler = require('errorhandler');
const IndexRouter = require('./routes');
const unleashDbSession = require('./middleware/session-db');
import { responseTimeMetrics } from './middleware/response-time-metrics';
const requestLogger = require('./middleware/request-logger');
const simpleAuthentication = require('./middleware/simple-authentication');
const noAuthentication = require('./middleware/no-authentication');
const secureHeaders = require('./middleware/secure-headers');

module.exports = function(config, services = {}) {
    const app = express();

    const baseUriPath = config.baseUriPath || '';

    app.set('trust proxy', true);
    app.disable('x-powered-by');
    app.set('port', config.port);
    app.locals.baseUriPath = baseUriPath;

    if (typeof config.preHook === 'function') {
        config.preHook(app);
    }

    app.use(compression());
    app.use(cookieParser());
    app.use(express.json({ strict: false }));
    app.use(unleashDbSession(config));
    app.use(responseTimeMetrics(config));
    app.use(requestLogger(config));
    app.use(secureHeaders(config));
    app.use(express.urlencoded({ extended: true }));

    if (config.publicFolder) {
        app.use(favicon(path.join(config.publicFolder, 'favicon.ico')));
        app.use(baseUriPath, express.static(config.publicFolder));
    }

    if (config.enableOAS) {
        app.use(`${baseUriPath}/oas`, express.static('docs/api/oas'));
    }

    if (config.adminAuthentication === 'unsecure') {
        simpleAuthentication(baseUriPath, app);
    }

    if (config.adminAuthentication === 'none') {
        noAuthentication(baseUriPath, app);
    }

    if (typeof config.preRouterHook === 'function') {
        config.preRouterHook(app);
    }

    // Setup API routes
    app.use(`${baseUriPath}/`, new IndexRouter(config, services).router);

    if (process.env.NODE_ENV !== 'production') {
        app.use(errorHandler());
    }

    return app;
};
