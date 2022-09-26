import { Logger } from '../logger';
import { IUnleashConfig } from '../types/option';
import { IUnleashStores } from '../types/stores';
import { IEventStore } from '../types/stores/event-store';
import {
    IMinimalStrategy,
    IStrategy,
    IStrategyStore,
} from '../types/stores/strategy-store';
import NotFoundError from '../error/notfound-error';

const strategySchema = require('./strategy-schema');
const NameExistsError = require('../error/name-exists-error');
const {
    STRATEGY_CREATED,
    STRATEGY_DELETED,
    STRATEGY_DEPRECATED,
    STRATEGY_REACTIVATED,
    STRATEGY_UPDATED,
} = require('../types/events');

class StrategyService {
    private logger: Logger;

    private strategyStore: IStrategyStore;

    private eventStore: IEventStore;

    constructor(
        {
            strategyStore,
            eventStore,
        }: Pick<IUnleashStores, 'strategyStore' | 'eventStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.strategyStore = strategyStore;
        this.eventStore = eventStore;
        this.logger = getLogger('services/strategy-service.js');
    }

    async getStrategies(): Promise<IStrategy[]> {
        return this.strategyStore.getAll();
    }

    async getStrategy(name: string): Promise<IStrategy> {
        return this.strategyStore.get(name);
    }

    async removeStrategy(
        strategyName: string,
        userName: string,
    ): Promise<void> {
        const strategy = await this.strategyStore.get(strategyName);
        await this._validateEditable(strategy);
        await this.strategyStore.delete(strategyName);
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
        if (await this.strategyStore.exists(strategyName)) {
            // Check existence
            await this.strategyStore.deprecateStrategy({ name: strategyName });
            await this.eventStore.store({
                type: STRATEGY_DEPRECATED,
                createdBy: userName,
                data: {
                    name: strategyName,
                },
            });
        } else {
            throw new NotFoundError(
                `Could not find strategy with name ${strategyName}`,
            );
        }
    }

    async reactivateStrategy(
        strategyName: string,
        userName: string,
    ): Promise<void> {
        await this.strategyStore.get(strategyName); // Check existence
        await this.strategyStore.reactivateStrategy({ name: strategyName });
        await this.eventStore.store({
            type: STRATEGY_REACTIVATED,
            createdBy: userName,
            data: {
                name: strategyName,
            },
        });
    }

    async createStrategy(
        value: IMinimalStrategy,
        userName: string,
    ): Promise<IStrategy> {
        const strategy = await strategySchema.validateAsync(value);
        strategy.deprecated = false;
        await this._validateStrategyName(strategy);
        await this.strategyStore.createStrategy(strategy);
        await this.eventStore.store({
            type: STRATEGY_CREATED,
            createdBy: userName,
            data: strategy,
        });
        return this.strategyStore.get(strategy.name);
    }

    async updateStrategy(
        input: IMinimalStrategy,
        userName: string,
    ): Promise<void> {
        const value = await strategySchema.validateAsync(input);
        const strategy = await this.strategyStore.get(input.name);
        await this._validateEditable(strategy);
        await this.strategyStore.updateStrategy(value);
        await this.eventStore.store({
            type: STRATEGY_UPDATED,
            createdBy: userName,
            data: value,
        });
    }

    private _validateStrategyName(
        data: Pick<IStrategy, 'name'>,
    ): Promise<Pick<IStrategy, 'name'>> {
        return new Promise((resolve, reject) => {
            this.strategyStore
                .get(data.name)
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
