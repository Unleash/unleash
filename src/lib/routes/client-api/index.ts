import Controller from '../controller';
import FeatureController from '../../features/client-feature-toggles/client-feature-toggle.controller';
import MetricsController from '../../features/metrics/instance/metrics';
import RegisterController from '../../features/metrics/instance/register';
import type { IUnleashConfig, IUnleashServices } from '../../types';
import ClientFeatureToggleDeltaController from '../../features/client-feature-toggles/delta/client-feature-toggle-cache-controller';

export default class ClientApi extends Controller {
    constructor(config: IUnleashConfig, services: IUnleashServices) {
        super(config);

        this.use(
            '/delta',
            new ClientFeatureToggleDeltaController(services, config).router,
        );
        this.use('/features', new FeatureController(services, config).router);
        this.use('/metrics', new MetricsController(services, config).router);
        this.use('/register', new RegisterController(services, config).router);
    }
}

module.exports = ClientApi;
