import { responseTimeMetrics } from './middleware/response-time-metrics';
import rbacMiddleware from './middleware/rbac-middleware';
import apiTokenMiddleware from './middleware/api-token-middleware';
import { AuthenticationType } from './types/core';

const express = require('express');

const compression = require('compression');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const path = require('path');
const errorHandler = require('errorhandler');
const IndexRouter = require('./routes');
const unleashDbSession = require('./middleware/session-db');

const requestLogger = require('./middleware/request-logger');
const simpleAuthentication = require('./middleware/simple-authentication');
const ossAuthentication = require('./middleware/oss-authentication');
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

    if (config.adminAuthentication === AuthenticationType.none) {
        noAuthentication(baseUriPath, app);
    }

    // Deprecated. Will go away in v4.
    if (config.adminAuthentication === AuthenticationType.unsecure) {
        app.use(baseUriPath, apiTokenMiddleware(config, services));
        simpleAuthentication(baseUriPath, app);
    }

    if (config.adminAuthentication === AuthenticationType.openSource) {
        app.use(baseUriPath, apiTokenMiddleware(config, services));
        ossAuthentication(app, config, services);
    }

    if (config.adminAuthentication === AuthenticationType.enterprise) {
        app.use(baseUriPath, apiTokenMiddleware(config, services));
        config.authentication.customHook(app, config, services);
    }

    if (config.adminAuthentication === AuthenticationType.custom) {
        app.use(baseUriPath, apiTokenMiddleware(config, services));
        config.authentication.customHook(app, config, services);
    }

    app.use(baseUriPath, rbacMiddleware(config, services));

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
