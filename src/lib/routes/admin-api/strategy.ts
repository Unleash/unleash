import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import StrategyService from '../../services/strategy-service';
import { Logger } from '../../logger';

import Controller from '../controller';

import { extractUsername } from '../../util/extract-user';
import { handleErrors } from '../util';
import {
    DELETE_STRATEGY,
    CREATE_STRATEGY,
    UPDATE_STRATEGY,
} from '../../types/permissions';
import { Request, Response } from 'express';
import { IAuthRequest } from '../unleash-types';

const version = 1;

class StrategyController extends Controller {
    private logger: Logger;

    private strategyService: StrategyService;

    constructor(
        config: IUnleashConfig,
        { strategyService }: Pick<IUnleashServices, 'strategyService'>,
    ) {
        super(config);
        this.logger = config.getLogger('/admin-api/strategy.js');
        this.strategyService = strategyService;

        this.get('/', this.getAllStrategies);
        this.get('/:name', this.getStrategy);
        this.delete('/:name', this.removeStrategy, DELETE_STRATEGY);
        this.post('/', this.createStrategy, CREATE_STRATEGY);
        this.put('/:strategyName', this.updateStrategy, UPDATE_STRATEGY);
        this.post(
            '/:strategyName/deprecate',
            this.deprecateStrategy,
            UPDATE_STRATEGY,
        );
        this.post(
            '/:strategyName/reactivate',
            this.reactivateStrategy,
            UPDATE_STRATEGY,
        );
    }

    async getAllStrategies(req: Request, res: Response): Promise<void> {
        const strategies = await this.strategyService.getStrategies();
        res.json({ version, strategies });
    }

    async getStrategy(req: Request, res: Response): Promise<void> {
        const { name } = req.params;
        const strategy = await this.strategyService.getStrategy(name);
        res.json(strategy).end();
    }

    async removeStrategy(req: IAuthRequest, res: Response): Promise<void> {
        const strategyName = req.params.name;
        const userName = extractUsername(req);

        await this.strategyService.removeStrategy(strategyName, userName);
        res.status(200).end();
    }

    async createStrategy(req: IAuthRequest, res: Response): Promise<void> {
        const userName = extractUsername(req);

        await this.strategyService.createStrategy(req.body, userName);
        res.status(201).end();
    }

    async updateStrategy(req: IAuthRequest, res: Response): Promise<void> {
        const userName = extractUsername(req);

        await this.strategyService.updateStrategy(req.body, userName);
        res.status(200).end();
    }

    async deprecateStrategy(req: IAuthRequest, res: Response): Promise<void> {
        const userName = extractUsername(req);
        const { strategyName } = req.params;

        if (strategyName === 'default') {
            res.status(403).end();
            return;
        }

        await this.strategyService.deprecateStrategy(strategyName, userName);
        res.status(200).end();
    }

    async reactivateStrategy(req: IAuthRequest, res: Response): Promise<void> {
        const userName = extractUsername(req);
        const { strategyName } = req.params;
        try {
            await this.strategyService.reactivateStrategy(
                strategyName,
                userName,
            );
            res.status(200).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }
}
export default StrategyController;
