import { BackstageController } from './backstage.js';
import ResetPasswordController from './auth/reset-password-controller.js';
import { SimplePasswordProvider } from './auth/simple-password-provider.js';
import type { IUnleashConfig, IUnleashStores } from '../types/index.js';
import LogoutController from './logout.js';
import rateLimit from 'express-rate-limit';
import Controller from './controller.js';
import { AdminApi } from './admin-api/index.js';
import ClientApi from './client-api/index.js';

import { ReadyCheckController } from './ready-check.js';
import { HealthCheckController } from './health-check.js';
import FrontendAPIController from '../features/frontend-api/frontend-api-controller.js';
import EdgeController from './edge-api/index.js';
import { PublicInviteController } from './public-invite.js';
import type { Db } from '../db/db.js';
import { minutesToMilliseconds } from 'date-fns';
import type { IUnleashServices } from '../services/index.js';

class IndexRouter extends Controller {
    constructor(
        config: IUnleashConfig,
        services: IUnleashServices,
        stores: IUnleashStores,
        db: Db,
    ) {
        super(config);

        this.use(
            '/ready',
            new ReadyCheckController(config, services, db).router,
        );
        this.use('/health', new HealthCheckController(config, services).router);
        this.use(
            '/invite',
            new PublicInviteController(config, services).router,
        );
        this.use(
            '/internal-backstage',
            new BackstageController(config, services).router,
        );
        this.use('/logout', new LogoutController(config, services).router);
        this.useWithMiddleware(
            '/auth/simple',
            new SimplePasswordProvider(config, services).router,
            rateLimit({
                windowMs: minutesToMilliseconds(1),
                max: config.rateLimiting.simpleLoginMaxPerMinute,
                validate: false,
                standardHeaders: true,
                legacyHeaders: false,
            }),
        );
        this.use(
            '/auth/reset',
            new ResetPasswordController(config, services).router,
        );

        this.use(
            '/api/admin',
            new AdminApi(config, services, stores, db).router,
        );
        this.use('/api/client', new ClientApi(config, services).router);

        this.use(
            '/api/frontend',
            new FrontendAPIController(config, services).router,
        );

        this.use('/edge', new EdgeController(config, services).router);
    }
}

export default IndexRouter;
