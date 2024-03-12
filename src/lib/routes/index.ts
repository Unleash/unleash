import { BackstageController } from './backstage';
import ResetPasswordController from './auth/reset-password-controller';
import { SimplePasswordProvider } from './auth/simple-password-provider';
import type { IUnleashConfig, IUnleashServices } from '../types';
import LogoutController from './logout';
import rateLimit from 'express-rate-limit';
import Controller from './controller';
import { AdminApi } from './admin-api';
import ClientApi from './client-api';

import { HealthCheckController } from './health-check';
import FrontendAPIController from '../features/frontend-api/frontend-api-controller';
import EdgeController from './edge-api';
import { PublicInviteController } from './public-invite';
import type { Db } from '../db/db';
import { minutesToMilliseconds } from 'date-fns';

class IndexRouter extends Controller {
    constructor(config: IUnleashConfig, services: IUnleashServices, db: Db) {
        super(config);

        this.use('/health', new HealthCheckController(config, services).router);
        this.use(
            '/invite',
            new PublicInviteController(config, services).router,
        );
        this.use('/internal-backstage', new BackstageController(config).router);
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

        this.use('/api/admin', new AdminApi(config, services, db).router);
        this.use('/api/client', new ClientApi(config, services).router);

        this.use(
            '/api/frontend',
            new FrontendAPIController(config, services).router,
        );

        this.use('/edge', new EdgeController(config, services).router);
    }
}

export default IndexRouter;

module.exports = IndexRouter;
