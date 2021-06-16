import { Request, Response } from 'express';
import Controller from '../controller';
import { IUnleashServices } from '../../types/services';
import { IUnleashConfig } from '../../types/option';
import ProjectV2Controller from './project-v2-controller';
import { Logger } from '../../logger';
import apiDef from './api-def.json';

export default class V2ApiController extends Controller {
    private logger: Logger;

    constructor(config: IUnleashConfig, services: IUnleashServices) {
        super(config);
        this.logger = config.getLogger('routes/v2/index.ts');
        this.app.get('/', this.index);
        this.use('/projects', new ProjectV2Controller(config, services).router);
    }

    async index(req: Request, res: Response): Promise<void> {
        res.json(apiDef);
    }
}
