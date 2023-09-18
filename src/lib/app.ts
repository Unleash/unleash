import express, { Application, RequestHandler } from 'express';
import compression from 'compression';
import favicon from 'serve-favicon';
import cookieParser from 'cookie-parser';
import path from 'path';
import errorHandler from 'errorhandler';
import { responseTimeMetrics } from './middleware/response-time-metrics';
import { corsOriginMiddleware } from './middleware/cors-origin-middleware';
import rbacMiddleware from './middleware/rbac-middleware';
import apiTokenMiddleware from './middleware/api-token-middleware';
import { IUnleashServices } from './types/services';
import { IAuthType, IUnleashConfig } from './types/option';
import { IUnleashStores } from './types/stores';

import IndexRouter from './routes';

import requestLogger from './middleware/request-logger';
import demoAuthentication from './middleware/demo-authentication';
import ossAuthentication from './middleware/oss-authentication';
import noAuthentication from './middleware/no-authentication';
import secureHeaders from './middleware/secure-headers';

import { loadIndexHTML } from './util/load-index-html';
import { findPublicFolder } from './util/findPublicFolder';
import { conditionalMiddleware } from './middleware/conditional-middleware';
import patMiddleware from './middleware/pat-middleware';
import { Knex } from 'knex';
import maintenanceMiddleware from './middleware/maintenance-middleware';
import { unless } from './middleware/unless-middleware';
import { catchAllErrorHandler } from './middleware/catch-all-error-handler';
import NotFoundError from './error/notfound-error';

export default async function getApp(
    config: IUnleashConfig,
    stores: IUnleashStores,
    services: IUnleashServices,
    unleashSession?: RequestHandler,
    db?: Knex,
): Promise<Application> {
    const app = express();

    const baseUriPath = config.server.baseUriPath || '';
    const publicFolder = config.publicFolder || findPublicFolder();
    let indexHTML = await loadIndexHTML(config, publicFolder);

    app.set('trust proxy', true);
    app.disable('x-powered-by');
    app.set('port', config.server.port);
    app.locals.baseUriPath = baseUriPath;
    if (config.server.serverMetrics && config.eventBus) {
        app.use(
            responseTimeMetrics(
                config.eventBus,
                config.flagResolver,
                services.instanceStatsService,
            ),
        );
    }

    app.use(requestLogger(config));

    if (typeof config.preHook === 'function') {
        config.preHook(app, config, services, db);
    }

    app.use(compression());
    app.use(cookieParser());

    app.use((req, res, next) => {
        req.url = req.url.replace(/\/+/g, '/');
        next();
    });

    app.use(
        `${baseUriPath}/api/admin/features-batch`,
        express.json({ strict: false, limit: '500kB' }),
    );
    app.use(
        unless(
            `${baseUriPath}/api/admin/features-batch`,
            express.json({ strict: false }),
        ),
    );
    if (unleashSession) {
        app.use(unleashSession);
    }
    app.use(secureHeaders(config));
    app.use(express.urlencoded({ extended: true }));
    app.use(favicon(path.join(publicFolder, 'favicon.ico')));
    app.use(baseUriPath, favicon(path.join(publicFolder, 'favicon.ico')));
    app.use(baseUriPath, express.static(publicFolder, { index: false }));

    if (config.enableOAS) {
        app.use(`${baseUriPath}/oas`, express.static('docs/api/oas'));
    }

    if (config.enableOAS && services.openApiService) {
        services.openApiService.useDocs(app);
    }
    // Support CORS preflight requests for the frontend endpoints.
    // Preflight requests should not have Authorization headers,
    // so this must be handled before the API token middleware.
    app.options(
        `${baseUriPath}/api/frontend*`,
        conditionalMiddleware(
            () => config.flagResolver.isEnabled('embedProxy'),
            corsOriginMiddleware(services, config),
        ),
    );

    app.use(baseUriPath, patMiddleware(config, services));

    switch (config.authentication.type) {
        case IAuthType.OPEN_SOURCE: {
            app.use(baseUriPath, apiTokenMiddleware(config, services));
            ossAuthentication(app, config.getLogger, config.server.baseUriPath);
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
            demoAuthentication(
                app,
                config.server.baseUriPath,
                services,
                config,
            );
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
            app.use(baseUriPath, apiTokenMiddleware(config, services));
            demoAuthentication(
                app,
                config.server.baseUriPath,
                services,
                config,
            );
            break;
        }
    }

    app.use(
        baseUriPath,
        rbacMiddleware(config, stores, services.accessService),
    );

    app.use(
        `${baseUriPath}/api/admin`,
        maintenanceMiddleware(config, services.maintenanceService),
    );

    if (typeof config.preRouterHook === 'function') {
        config.preRouterHook(app, config, services, stores, db);
    }

    // Setup API routes
    app.use(`${baseUriPath}/`, new IndexRouter(config, services, db).router);

    if (services.openApiService) {
        services.openApiService.useErrorHandler(app);
    }

    if (process.env.NODE_ENV !== 'production') {
        app.use(errorHandler());
    } else {
        app.use(catchAllErrorHandler(config.getLogger));
    }

    app.get(`${baseUriPath}`, (req, res) => {
        res.send(indexHTML);
    });

    // handle all API 404s
    app.use(`${baseUriPath}/api`, (req, res) => {
        const error = new NotFoundError(
            `The path you were looking for (${baseUriPath}/api${req.path}) is not available.`,
        );
        res.status(error.statusCode).send(error);
        return;
    });

    app.get(`${baseUriPath}/*`, (req, res) => {
        res.send(indexHTML);
    });

    return app;
}
