import express, { type Application, type RequestHandler } from 'express';
import compression from 'compression';
import favicon from 'serve-favicon';
import cookieParser from 'cookie-parser';
import path from 'path';
import errorHandler from 'errorhandler';
import {
    responseTimeMetrics,
    corsOriginMiddleware,
} from './middleware/index.js';
import rbacMiddleware from './middleware/rbac-middleware.js';
import { apiAccessMiddleware } from './middleware/api-token-middleware.js';
import type { IUnleashServices } from './services/index.js';
import { IAuthType, type IUnleashConfig } from './types/option.js';
import type { IUnleashStores } from './types/index.js';

import IndexRouter from './routes/index.js';

import requestLogger from './middleware/request-logger.js';
import demoAuthentication from './middleware/demo-authentication.js';
import ossAuthentication from './middleware/oss-authentication.js';
import noAuthentication, {
    noApiToken,
} from './middleware/no-authentication.js';
import secureHeaders from './middleware/secure-headers.js';

import { loadIndexHTML, findPublicFolder } from './util/index.js';
import patMiddleware from './middleware/pat-middleware.js';
import type { Knex } from 'knex';
import maintenanceMiddleware from './features/maintenance/maintenance-middleware.js';
import { unless } from './middleware/unless-middleware.js';
import { catchAllErrorHandler } from './middleware/catch-all-error-handler.js';
import NotFoundError from './error/notfound-error.js';
import { bearerTokenMiddleware } from './middleware/bearer-token-middleware.js';
import { auditAccessMiddleware } from './middleware/index.js';
import { originMiddleware } from './middleware/origin-middleware.js';

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
    const indexHTML = await loadIndexHTML(config, publicFolder);
    const logger = config.getLogger('lib/app.ts');

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

    app.use(`${baseUriPath}/api`, bearerTokenMiddleware(config)); // We only need bearer token compatibility on /api paths.

    if (typeof config.preHook === 'function') {
        config.preHook(app, config, services, db);
    }

    if (!config.server.disableCompression) {
        app.use(compression());
    }

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

    app.use(
        `${baseUriPath}/api/frontend*`,
        corsOriginMiddleware(services, config),
    );
    app.options(
        `${baseUriPath}/api/streaming*`,
        corsOriginMiddleware(services, config),
    );

    app.use(baseUriPath, patMiddleware(config, services));

    switch (config.authentication.type) {
        case IAuthType.OPEN_SOURCE: {
            app.use(baseUriPath, apiAccessMiddleware(config, services));
            ossAuthentication(app, config.getLogger, config.server.baseUriPath);
            break;
        }
        case IAuthType.ENTERPRISE: {
            app.use(baseUriPath, apiAccessMiddleware(config, services));
            if (config.authentication.customAuthHandler) {
                config.authentication.customAuthHandler(app, config, services);
            }
            break;
        }
        case IAuthType.HOSTED: {
            app.use(baseUriPath, apiAccessMiddleware(config, services));
            if (config.authentication.customAuthHandler) {
                config.authentication.customAuthHandler(app, config, services);
            }
            break;
        }
        case IAuthType.DEMO: {
            app.use(baseUriPath, apiAccessMiddleware(config, services));
            demoAuthentication(
                app,
                config.server.baseUriPath,
                services,
                config,
            );
            break;
        }
        case IAuthType.CUSTOM: {
            app.use(baseUriPath, apiAccessMiddleware(config, services));
            if (config.authentication.customAuthHandler) {
                config.authentication.customAuthHandler(app, config, services);
            }
            break;
        }
        case IAuthType.NONE: {
            logger.warn(
                'The AuthType=none option for Unleash is no longer recommended and will be removed in version 6.',
            );
            noApiToken(baseUriPath, app);
            app.use(baseUriPath, apiAccessMiddleware(config, services));
            noAuthentication(baseUriPath, app);
            break;
        }
        default: {
            app.use(baseUriPath, apiAccessMiddleware(config, services));
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

    app.use(`${baseUriPath}/api/admin`, originMiddleware(config));

    app.use(`${baseUriPath}/api/admin`, auditAccessMiddleware(config));
    app.use(
        `${baseUriPath}/api/admin`,
        maintenanceMiddleware(config, services.maintenanceService),
    );

    if (typeof config.preRouterHook === 'function') {
        config.preRouterHook(app, config, services, stores, db);
    }

    // Setup API routes
    const indexRouter = new IndexRouter(config, services, stores, db!);

    if (config.enableOAS && services.openApiService) {
        await services.openApiService.useDocs(app, indexRouter.router);
    }

    app.use(`${baseUriPath}/`, indexRouter.router);

    if (process.env.NODE_ENV !== 'production') {
        app.use(errorHandler());
    } else {
        app.use(catchAllErrorHandler(config.getLogger));
    }

    app.get(`${baseUriPath}`, (req, res) => {
        res.set('Content-Type', 'text/html');
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
        res.set('Content-Type', 'text/html');
        const requestPath = path.parse(req.url);
        // appropriately return 404 requests for assets with an extension (js, css, etc)
        if (requestPath.ext !== '' && requestPath.ext !== 'html') {
            res.set('Cache-Control', 'no-cache');
            res.status(404).send(indexHTML);
            return;
        }
        res.send(indexHTML);
    });

    return app;
}
