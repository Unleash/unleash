import { BackstageController } from './backstage';
import ResetPasswordController from './auth/reset-password-controller';
import { SimplePasswordProvider } from './auth/simple-password-provider';
import { IUnleashConfig } from '../types/option';
import { IUnleashServices } from '../types/services';
import LogoutController from './logout';

const AdminApi = require('./admin-api');
const ClientApi = require('./client-api');
const Controller = require('./controller');
import { HealthCheckController } from './health-check';
import ProxyController from './proxy-api';
import { conditionalMiddleware } from '../middleware/conditional-middleware';

class IndexRouter extends Controller {
    constructor(config: IUnleashConfig, services: IUnleashServices) {
        super(config);

        this.use('/health', new HealthCheckController(config, services).router);
        this.use('/internal-backstage', new BackstageController(config).router);
        this.use('/logout', new LogoutController(config).router);
        this.use(
            '/auth/simple',
            new SimplePasswordProvider(config, services).router,
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
    }
}

export default IndexRouter;

module.exports = IndexRouter;
