import { BackstageController } from './backstage';
import ResetPasswordController from './auth/reset-password-controller';
import { SimplePasswordProvider } from './auth/simple-password-provider';
import { IUnleashConfig, IUnleashServices } from '../types';
import LogoutController from './logout';
import rateLimit from 'express-rate-limit';

const AdminApi = require('./admin-api');
const ClientApi = require('./client-api');
const Controller = require('./controller');
import { HealthCheckController } from './health-check';
import ProxyController from './proxy-api';
import { conditionalMiddleware } from '../middleware/conditional-middleware';
import EdgeController from './edge-api';
import { PublicInviteController } from './public-invite';

class IndexRouter extends Controller {
    constructor(config: IUnleashConfig, services: IUnleashServices) {
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
                windowMs: 1 * 60 * 1000,
                max: 5,
                standardHeaders: true,
                legacyHeaders: false,
            }),
        );
        this.use(
            '/auth/reset',
            new ResetPasswordController(config, services).router,
        );

        this.use('/api/admin', new AdminApi(config, services).router);
        this.use('/api/client', new ClientApi(config, services).router);

        this.use(
            '/api/frontend',
            conditionalMiddleware(
                () => config.flagResolver.isEnabled('embedProxy'),
                new ProxyController(config, services).router,
            ),
        );

        this.use('/edge', new EdgeController(config, services).router);
    }
}

export default IndexRouter;

module.exports = IndexRouter;
