import { Request, Response } from 'express';
import Controller from '../controller';
import { IUnleashServices } from '../../types/services';
import { IUnleashConfig } from '../../types/option';
import { IEnvironment } from '../../types/model';
import EnvironmentService from '../../services/environment-service';
import { Logger } from '../../logger';
import { handleErrors } from './util';

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
        this.post('/', this.createEnv);
        this.get('/:name', this.getEnv);
        this.put('/:name', this.updateEnv);
        this.delete('/:name', this.deleteEnv);
    }

    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const environments = await this.service.getAll();
            res.status(200).json({ version: 1, environments });
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    async createEnv(
        req: Request<any, any, IEnvironment, any>,
        res: Response,
    ): Promise<void> {
        try {
            const environment = await this.service.create(req.body);
            res.status(201).json(environment);
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    async getEnv(
        req: Request<EnvironmentParam, any, any, any>,
        res: Response,
    ): Promise<void> {
        const { name } = req.params;
        try {
            const env = await this.service.get(name);
            res.status(200).json(env);
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    async updateEnv(
        req: Request<EnvironmentParam, any, IEnvironment, any>,
        res: Response,
    ): Promise<void> {
        const { name } = req.params;
        try {
            const env = await this.service.update(name, req.body);
            res.status(200).json(env);
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    async deleteEnv(
        req: Request<EnvironmentParam, any, any, any>,
        res: Response,
    ): Promise<void> {
        const { name } = req.params;
        try {
            await this.service.delete(name);
            res.status(200);
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }
}
