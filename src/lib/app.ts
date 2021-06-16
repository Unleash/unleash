import { publicFolder } from 'unleash-frontend';
import fs from 'fs';
import EventEmitter from 'events';
import express, { Application } from 'express';
import cors from 'cors';
import compression from 'compression';
import favicon from 'serve-favicon';
import cookieParser from 'cookie-parser';
import path from 'path';
import errorHandler from 'errorhandler';
import { responseTimeMetrics } from './middleware/response-time-metrics';
import rbacMiddleware from './middleware/rbac-middleware';
import apiTokenMiddleware from './middleware/api-token-middleware';
import { IUnleashServices } from './types/services';
import { IAuthType, IUnleashConfig } from './types/option';
import { IUnleashStores } from './types/stores';
import unleashDbSession from './middleware/session-db';

import IndexRouter from './routes';

import requestLogger from './middleware/request-logger';
import demoAuthentication from './middleware/demo-authentication';
import ossAuthentication from './middleware/oss-authentication';
import noAuthentication from './middleware/no-authentication';
import secureHeaders from './middleware/secure-headers';
import { rewriteHTML } from './util/rewriteHTML';

export default function getApp(
    config: IUnleashConfig,
    stores: IUnleashStores,
    services: IUnleashServices,
    eventBus?: EventEmitter,
): Application {
    const app = express();

    const baseUriPath = config.server.baseUriPath || '';

    let indexHTML = fs
        .readFileSync(path.join(publicFolder, 'index.html'))
        .toString();

    indexHTML = rewriteHTML(indexHTML, baseUriPath);

    app.set('trust proxy', true);
    app.disable('x-powered-by');
    app.set('port', config.server.port);
    app.locals.baseUriPath = baseUriPath;

    if (config.server.serverMetrics && eventBus) {
        app.use(responseTimeMetrics(eventBus));
    }

    app.use(requestLogger(config));

    if (typeof config.preHook === 'function') {
        config.preHook(app, config, services);
    }

    if (process.env.NODE_ENV === 'development') {
        app.use(cors());
    }

    app.use(compression());
    app.use(cookieParser());
    app.use(express.json({ strict: false }));
    app.use(unleashDbSession(config, stores));
    app.use(secureHeaders(config));
    app.use(express.urlencoded({ extended: true }));
    app.use(favicon(path.join(publicFolder, 'favicon.ico')));

    app.use(baseUriPath, express.static(publicFolder, { index: false }));

    if (config.enableOAS) {
        app.use(`${baseUriPath}/oas`, express.static('docs/api/oas'));
    }
    switch (config.authentication.type) {
        case IAuthType.OPEN_SOURCE: {
            app.use(baseUriPath, apiTokenMiddleware(config, services));
            ossAuthentication(app, config);
            break;
        }
        case IAuthType.ENTERPRISE: {
            app.use(baseUriPath, apiTokenMiddleware(config, services));
            config.authentication.customAuthHandler(app, config, services);
            break;
        }
        case IAuthType.HOSTED: {
            app.use(baseUriPath, apiTokenMiddleware(config, services));
            config.authentication.customAuthHandler(app, config, services);
            break;
        }
        case IAuthType.DEMO: {
            app.use(baseUriPath, apiTokenMiddleware(config, services));
            demoAuthentication(app, config.server.baseUriPath, services);
            break;
        }
        case IAuthType.CUSTOM: {
            app.use(baseUriPath, apiTokenMiddleware(config, services));
            config.authentication.customAuthHandler(app, config, services);
            break;
        }
        case IAuthType.NONE: {
            noAuthentication(baseUriPath, app);
            break;
        }
        default: {
            demoAuthentication(app, config.server.baseUriPath, services);
            break;
        }
    }

    app.use(
        baseUriPath,
        rbacMiddleware(config, stores, services.accessService),
    );

    if (typeof config.preRouterHook === 'function') {
        config.preRouterHook(app, config, services, stores);
    }

    // Setup API routes
    app.use(`${baseUriPath}/`, new IndexRouter(config, services).router);

    if (process.env.NODE_ENV !== 'production') {
        app.use(errorHandler());
    }

    app.get(`${baseUriPath}`, (req, res) => {
        res.send(indexHTML);
    });

    app.get(`${baseUriPath}/*`, (req, res) => {
        if (req.path.startsWith(`${baseUriPath}/api`)) {
            res.status(404).send({ message: '404 - Not found' });
            return;
        }

        res.send(indexHTML);
    });
    return app;
}
module.exports = getApp;
