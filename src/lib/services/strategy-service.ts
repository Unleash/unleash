import { Logger } from '../logger';
import { IUnleashConfig } from '../types/option';
import { IUnleashStores } from '../types/stores';
import {
    IMinimalStrategy,
    IStrategy,
    IStrategyStore,
} from '../types/stores/strategy-store';
import NotFoundError from '../error/notfound-error';
import EventService from '../features/events/event-service';

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

    private eventService: EventService;

    constructor(
        { strategyStore }: Pick<IUnleashStores, 'strategyStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
        eventService: EventService,
    ) {
        this.strategyStore = strategyStore;
        this.eventService = eventService;
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
        userId: number,
    ): Promise<void> {
        const strategy = await this.strategyStore.get(strategyName);
        await this._validateEditable(strategy);
        await this.strategyStore.delete(strategyName);
        await this.eventService.storeEvent({
            type: STRATEGY_DELETED,
            createdBy: userName,
            createdByUserId: userId,
            data: {
                name: strategyName,
            },
        });
    }

    async deprecateStrategy(
        strategyName: string,
        userName: string,
        userId: number,
    ): Promise<void> {
        if (await this.strategyStore.exists(strategyName)) {
            // Check existence
            await this.strategyStore.deprecateStrategy({ name: strategyName });
            await this.eventService.storeEvent({
                type: STRATEGY_DEPRECATED,
                createdBy: userName,
                createdByUserId: userId,
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
        userId: number,
    ): Promise<void> {
        await this.strategyStore.get(strategyName); // Check existence
        await this.strategyStore.reactivateStrategy({ name: strategyName });
        await this.eventService.storeEvent({
            type: STRATEGY_REACTIVATED,
            createdBy: userName,
            createdByUserId: userId,
            data: {
                name: strategyName,
            },
        });
    }

    async createStrategy(
        value: IMinimalStrategy,
        userName: string,
        userId: number,
    ): Promise<IStrategy> {
        const strategy = await strategySchema.validateAsync(value);
        strategy.deprecated = false;
        await this._validateStrategyName(strategy);
        await this.strategyStore.createStrategy(strategy);
        await this.eventService.storeEvent({
            type: STRATEGY_CREATED,
            createdBy: userName,
            data: strategy,
            createdByUserId: userId,
        });
        return this.strategyStore.get(strategy.name);
    }

    async updateStrategy(
        input: IMinimalStrategy,
        userName: string,
        userId: number,
    ): Promise<void> {
        const value = await strategySchema.validateAsync(input);
        const strategy = await this.strategyStore.get(input.name);
        await this._validateEditable(strategy);
        await this.strategyStore.updateStrategy(value);
        await this.eventService.storeEvent({
            type: STRATEGY_UPDATED,
            createdBy: userName,
            data: value,
            createdByUserId: userId,
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
        if (!strategy.editable) {
            throw new Error(`Cannot edit strategy ${strategy.name}`);
        }
    }
}
export default StrategyService;
module.exports = StrategyService;
