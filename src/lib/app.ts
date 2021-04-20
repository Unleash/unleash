import { publicFolder } from 'unleash-frontend';
import EventEmitter from 'events';
import { responseTimeMetrics } from './middleware/response-time-metrics';
import rbacMiddleware from './middleware/rbac-middleware';
import apiTokenMiddleware from './middleware/api-token-middleware';
import { IUnleashServices } from './types/services';
import { AuthType, IUnleashConfig } from './types/option';
import { IUnleashStores } from './types/stores';

const express = require('express');
const cors = require('cors');
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

export default function getApp(
    config: IUnleashConfig,
    stores: IUnleashStores,
    services: IUnleashServices,
    eventBus?: EventEmitter,
): any {
    const app = express();

    const baseUriPath = config.server.baseUriPath || '';

    app.set('trust proxy', true);
    app.disable('x-powered-by');
    app.set('port', config.server.port);
    app.locals.baseUriPath = baseUriPath;

    if (typeof config.preHook === 'function') {
        config.preHook(app, config, services);
    }

    if (process.env.NODE_ENV === 'development') {
        app.use(cors());
    }

    app.use(compression());
    app.use(cookieParser());
    app.use(express.json({ strict: false }));
    app.use(unleashDbSession(config));
    if (config.server.serverMetrics && eventBus) {
        app.use(responseTimeMetrics(eventBus));
    }
    app.use(requestLogger(config));
    app.use(secureHeaders(config));
    app.use(express.urlencoded({ extended: true }));
    app.use(favicon(path.join(publicFolder, 'favicon.ico')));
    app.use(baseUriPath, express.static(publicFolder));

    if (config.enableOAS) {
        app.use(`${baseUriPath}/oas`, express.static('docs/api/oas'));
    }
    switch (config.authentication.type) {
        case AuthType.OPEN_SOURCE: {
            app.use(baseUriPath, apiTokenMiddleware(config, services));
            ossAuthentication(app, config, services);
            break;
        }
        case AuthType.ENTERPRISE: {
            app.use(baseUriPath, apiTokenMiddleware(config, services));
            config.authentication.customAuthHandler(app, config, services);
            break;
        }
        case AuthType.DEMO: {
            simpleAuthentication(app, config, services);
            break;
        }
        case AuthType.CUSTOM: {
            app.use(baseUriPath, apiTokenMiddleware(config, services));
            config.authentication.customAuthHandler(app, config, services);
            break;
        }
        case AuthType.NONE: {
            noAuthentication(baseUriPath, app);
            break;
        }
        default: {
            simpleAuthentication(app, config, services);
            break;
        }
    }

    app.use(baseUriPath, rbacMiddleware(config, stores, services));

    if (typeof config.preRouterHook === 'function') {
        config.preRouterHook(app);
    }

    // Setup API routes
    app.use(`${baseUriPath}/`, new IndexRouter(config, services).router);

    if (process.env.NODE_ENV !== 'production') {
        app.use(errorHandler());
    }

    return app;
}
module.exports = getApp;
