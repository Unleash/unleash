import Controller from '../controller';
import FeatureController from '../../features/client-feature-toggles/client-feature-toggle.controller';
import MetricsController from '../../features/metrics/instance/metrics';
import RegisterController from '../../features/metrics/instance/register';
import type { IUnleashConfig, IUnleashServices } from '../../types';

export default class ClientApi extends Controller {
    constructor(config: IUnleashConfig, services: IUnleashServices) {
        super(config);

        this.use('/features', new FeatureController(services, config).router);
        this.use('/metrics', new MetricsController(services, config).router);
        this.use('/register', new RegisterController(services, config).router);
    }
}

module.exports = ClientApi;
