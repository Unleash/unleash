import Controller from '../controller.js';
import FeatureController from '../../features/client-feature-toggles/client-feature-toggle.controller.js';
import MetricsController from '../../features/metrics/instance/metrics.js';
import RegisterController from '../../features/metrics/instance/register.js';
import type { IUnleashConfig } from '../../types/index.js';
import type { IUnleashServices } from '../../services/index.js';

export default class ClientApi extends Controller {
    constructor(config: IUnleashConfig, services: IUnleashServices) {
        super(config);

        this.use('/features', new FeatureController(services, config).router);
        this.use('/metrics', new MetricsController(services, config).router);
        this.use('/register', new RegisterController(services, config).router);
    }
}
