import { Logger } from '../logger';
import EventStore from '../db/event-store';
import StrategyStore, { IStrategy, IStrategyName } from '../db/strategy-store';

const strategySchema = require('./strategy-schema');
const NameExistsError = require('../error/name-exists-error');
const {
    STRATEGY_CREATED,
    STRATEGY_DELETED,
    STRATEGY_DEPRECATED,
    STRATEGY_REACTIVATED,
    STRATEGY_UPDATED,
} = require('../event-type');

class StrategyService {
    private logger: Logger;

    private strategyStore: StrategyStore;

    private eventStore: EventStore;

    constructor({ strategyStore, eventStore }, { getLogger }) {
        this.strategyStore = strategyStore;
        this.eventStore = eventStore;
        this.logger = getLogger('services/strategy-service.js');
    }

    async getStrategies(): Promise<IStrategy[]> {
        return this.strategyStore.getStrategies();
    }

    async getStrategy(name: string): Promise<IStrategy> {
        return this.strategyStore.getStrategy(name);
    }

    async removeStrategy(
        strategyName: string,
        userName: string,
    ): Promise<void> {
        const strategy = await this.strategyStore.getStrategy(strategyName);
        await this._validateEditable(strategy);
        await this.strategyStore.deleteStrategy({ name: strategyName });
        await this.eventStore.store({
            type: STRATEGY_DELETED,
            createdBy: userName,
            data: {
                name: strategyName,
            },
        });
    }

    async deprecateStrategy(
        strategyName: string,
        userName: string,
    ): Promise<void> {
        await this.strategyStore.getStrategy(strategyName); // Check existence
        await this.strategyStore.deprecateStrategy({ name: strategyName });
        await this.eventStore.store({
            type: STRATEGY_DEPRECATED,
            createdBy: userName,
            data: {
                name: strategyName,
            },
        });
    }

    async reactivateStrategy(
        strategyName: string,
        userName: string,
    ): Promise<void> {
        await this.strategyStore.getStrategy(strategyName); // Check existence
        await this.strategyStore.reactivateStrategy({ name: strategyName });
        await this.eventStore.store({
            type: STRATEGY_REACTIVATED,
            createdBy: userName,
            data: {
                name: strategyName,
            },
        });
    }

    async createStrategy(value, userName: string): Promise<void> {
        const strategy = await strategySchema.validateAsync(value);
        strategy.deprecated = false;
        await this._validateStrategyName(strategy);
        await this.strategyStore.createStrategy(strategy);
        await this.eventStore.store({
            type: STRATEGY_CREATED,
            createdBy: userName,
            data: strategy,
        });
    }

    async updateStrategy(input, userName: string): Promise<void> {
        const value = await strategySchema.validateAsync(input);
        const strategy = await this.strategyStore.getStrategy(input.name);
        await this._validateEditable(strategy);
        await this.strategyStore.updateStrategy(value);
        await this.eventStore.store({
            type: STRATEGY_UPDATED,
            createdBy: userName,
            data: value,
        });
    }

    async _validateStrategyName(data: IStrategyName): Promise<IStrategyName> {
        return new Promise((resolve, reject) => {
            this.strategyStore
                .getStrategy(data.name)
                .then(() =>
                    reject(
                        new NameExistsError(
                            `Strategy with name ${data.name} already exist!`,
                        ),
                    ),
                )
                .catch(() => resolve(data));
        });
    }

    // This check belongs in the store.
    _validateEditable(strategy: IStrategy): void {
        if (strategy.editable === false) {
            throw new Error(`Cannot edit strategy ${strategy.name}`);
        }
    }
}
export default StrategyService;
module.exports = StrategyService;
