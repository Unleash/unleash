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
        try {
            const strategies = await this.strategyService.getStrategies();
            res.json({ version, strategies });
        } catch (err) {
            handleErrors(res, this.logger, err);
        }
    }

    async getStrategy(req: Request, res: Response): Promise<void> {
        try {
            const { name } = req.params;
            const strategy = await this.strategyService.getStrategy(name);
            res.json(strategy).end();
        } catch (err) {
            res.status(404).json({ error: 'Could not find strategy' });
        }
    }

    async removeStrategy(req: IAuthRequest, res: Response): Promise<void> {
        const strategyName = req.params.name;
        const userName = extractUsername(req);

        try {
            await this.strategyService.removeStrategy(strategyName, userName);
            res.status(200).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async createStrategy(req: IAuthRequest, res: Response): Promise<void> {
        const userName = extractUsername(req);
        try {
            await this.strategyService.createStrategy(req.body, userName);
            res.status(201).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async updateStrategy(req: IAuthRequest, res: Response): Promise<void> {
        const userName = extractUsername(req);
        try {
            await this.strategyService.updateStrategy(req.body, userName);
            res.status(200).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async deprecateStrategy(req: IAuthRequest, res: Response): Promise<void> {
        const userName = extractUsername(req);
        const { strategyName } = req.params;
        if (strategyName === 'default') {
            res.status(403).end();
        } else {
            try {
                await this.strategyService.deprecateStrategy(
                    strategyName,
                    userName,
                );
                res.status(200).end();
            } catch (error) {
                handleErrors(res, this.logger, error);
            }
        }
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
