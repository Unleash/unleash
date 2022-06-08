import { Request, Response } from 'express';
import Controller from '../controller';
import { IUnleashServices } from '../../types/services';
import { IUnleashConfig } from '../../types/option';
import { ISortOrder } from '../../types/model';
import EnvironmentService from '../../services/environment-service';
import { Logger } from '../../logger';
import { ADMIN } from '../../types/permissions';

interface EnvironmentParam {
    name: string;
}

export class EnvironmentsController extends Controller {
    private logger: Logger;

    private service: EnvironmentService;

    constructor(
        config: IUnleashConfig,
        { environmentService }: Pick<IUnleashServices, 'environmentService'>,
    ) {
        super(config);
        this.logger = config.getLogger('admin-api/environments-controller.ts');
        this.service = environmentService;
        this.get('/', this.getAll);
        this.put('/sort-order', this.updateSortOrder, ADMIN);
        this.get('/:name', this.getEnv);
        this.post('/:name/on', this.toggleEnvironmentOn, ADMIN);
        this.post('/:name/off', this.toggleEnvironmentOff, ADMIN);
    }

    async getAll(req: Request, res: Response): Promise<void> {
        const environments = await this.service.getAll();
        res.status(200).json({ version: 1, environments });
    }

    async updateSortOrder(
        req: Request<any, any, ISortOrder, any>,
        res: Response,
    ): Promise<void> {
        await this.service.updateSortOrder(req.body);
        res.status(200).end();
    }

    async toggleEnvironmentOn(
        req: Request<EnvironmentParam, any, any, any>,
        res: Response,
    ): Promise<void> {
        const { name } = req.params;
        await this.service.toggleEnvironment(name, true);
        res.status(204).end();
    }

    async toggleEnvironmentOff(
        req: Request<EnvironmentParam, any, any, any>,
        res: Response,
    ): Promise<void> {
        const { name } = req.params;
        await this.service.toggleEnvironment(name, false);
        res.status(204).end();
    }

    async getEnv(
        req: Request<EnvironmentParam, any, any, any>,
        res: Response,
    ): Promise<void> {
        const { name } = req.params;

        const env = await this.service.get(name);
        res.status(200).json(env);
    }
}
