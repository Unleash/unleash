import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import StrategyService from '../../services/strategy-service';
import { Logger } from '../../logger';

const Controller = require('../controller');

const extractUser = require('../../extract-user');
const { handleErrors } = require('../util');
const {
    DELETE_STRATEGY,
    CREATE_STRATEGY,
    UPDATE_STRATEGY,
} = require('../../types/permissions');

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

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async getAllStrategies(req, res): Promise<void> {
        try {
            const strategies = await this.strategyService.getStrategies();
            res.json({ version, strategies });
        } catch (err) {
            handleErrors(res, this.logger, err);
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async getStrategy(req, res): Promise<void> {
        try {
            const { name } = req.params;
            const strategy = await this.strategyService.getStrategy(name);
            res.json(strategy).end();
        } catch (err) {
            res.status(404).json({ error: 'Could not find strategy' });
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async removeStrategy(req, res): Promise<void> {
        const strategyName = req.params.name;
        const userName = extractUser(req);

        try {
            await this.strategyService.removeStrategy(strategyName, userName);
            res.status(200).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async createStrategy(req, res): Promise<void> {
        const userName = extractUser(req);
        try {
            await this.strategyService.createStrategy(req.body, userName);
            res.status(201).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async updateStrategy(req, res): Promise<void> {
        const userName = extractUser(req);
        try {
            await this.strategyService.updateStrategy(req.body, userName);
            res.status(200).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async deprecateStrategy(req, res): Promise<void> {
        const userName = extractUser(req);
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

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async reactivateStrategy(req, res): Promise<void> {
        const userName = extractUser(req);
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
module.exports = StrategyController;
