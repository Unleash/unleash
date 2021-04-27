import { Request, Response } from 'express';
import { BackstageController } from './backstage';
import ResetPasswordController from './auth/reset-password-controller';
import { IUnleashConfig } from '../types/option';
import { IUnleashServices } from '../types/services';

const AdminApi = require('./admin-api');
const ClientApi = require('./client-api');
const Controller = require('./controller');
const HealthCheckController = require('./health-check');
const LogoutController = require('./logout');
const api = require('./api-def');
const SimplePasswordProvider = require('./auth/simple-password-provider');

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
        this.get(api.uri, this.index);
        this.use(api.links.admin.uri, new AdminApi(config, services).router);
        this.use(api.links.client.uri, new ClientApi(config, services).router);
    }

    async index(req: Request, res: Response): Promise<void> {
        res.json(api);
    }
}

export default IndexRouter;

module.exports = IndexRouter;
