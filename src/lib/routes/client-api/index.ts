import Controller from '../controller';
import FeatureController from './feature';
import MetricsController from './metrics';
import RegisterController from './register';
import { IUnleashConfig, IUnleashServices } from '../../types';

export default class ClientApi extends Controller {
    constructor(config: IUnleashConfig, services: IUnleashServices) {
        super(config);

        this.use('/features', new FeatureController(services, config).router);
        this.use('/metrics', new MetricsController(services, config).router);
        this.use('/register', new RegisterController(services, config).router);
    }
}

module.exports = ClientApi;
