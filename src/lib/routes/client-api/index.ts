import { Request, Response } from 'express';
import Controller from '../controller';
import FeatureController from './feature';
import MetricsController from './metrics';
import RegisterController from './register';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types';
import { SegmentsController } from './segments';

const apiDef = require('./api-def.json');

export default class ClientApi extends Controller {
    constructor(config: IUnleashConfig, services: IUnleashServices) {
        super(config);

        this.get('/', this.index);
        this.use('/features', new FeatureController(services, config).router);
        this.use('/metrics', new MetricsController(services, config).router);
        this.use('/register', new RegisterController(services, config).router);

        if (config.experimental?.segments?.enableSegmentsClientApi) {
            this.use(
                '/segments',
                new SegmentsController(services, config).router,
            );
        }
    }

    index(req: Request, res: Response): void {
        res.json(apiDef);
    }
}

module.exports = ClientApi;
