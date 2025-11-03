import type { Logger } from '../logger.js';
import type { IUnleashConfig } from '../types/option.js';
import type { IUnleashStores } from '../types/stores.js';
import type {
    IMinimalStrategy,
    IStrategy,
    IStrategyStore,
} from '../types/stores/strategy-store.js';
import NotFoundError from '../error/notfound-error.js';
import type EventService from '../features/events/event-service.js';
import {
    type IAuditUser,
    StrategyCreatedEvent,
    StrategyDeletedEvent,
    StrategyDeprecatedEvent,
    StrategyReactivatedEvent,
    StrategyUpdatedEvent,
} from '../types/index.js';
import strategySchema from './strategy-schema.js';
import { NameExistsError, OperationDeniedError } from '../error/index.js';

class StrategyService {
    private logger: Logger;

    private strategyStore: IStrategyStore;

    private eventService: EventService;

    private customStrategySettings: IUnleashConfig['customStrategySettings'];

    constructor(
        { strategyStore }: Pick<IUnleashStores, 'strategyStore'>,
        {
            getLogger,
            customStrategySettings,
        }: Pick<IUnleashConfig, 'getLogger' | 'customStrategySettings'>,
        eventService: EventService,
    ) {
        this.strategyStore = strategyStore;
        this.eventService = eventService;
        this.logger = getLogger('services/strategy-service.js');
        this.customStrategySettings = customStrategySettings;
    }

    async getStrategies(): Promise<IStrategy[]> {
        return this.strategyStore.getAll();
    }

    async getStrategy(name: string): Promise<IStrategy | undefined> {
        return this.strategyStore.get(name);
    }

    async removeStrategy(
        strategyName: string,
        auditUser: IAuditUser,
    ): Promise<void> {
        const strategy = await this.strategyStore.get(strategyName);
        await this._validateEditable(strategy);
        await this.strategyStore.delete(strategyName);
        await this.eventService.storeEvent(
            new StrategyDeletedEvent({
                data: {
                    name: strategyName,
                },
                auditUser,
            }),
        );
    }

    async deprecateStrategy(
        strategyName: string,
        auditUser: IAuditUser,
    ): Promise<void> {
        if (await this.strategyStore.exists(strategyName)) {
            // Check existence
            await this.strategyStore.deprecateStrategy({ name: strategyName });
            await this.eventService.storeEvent(
                new StrategyDeprecatedEvent({
                    data: {
                        name: strategyName,
                    },
                    auditUser,
                }),
            );
        } else {
            throw new NotFoundError(
                `Could not find strategy with name ${strategyName}`,
            );
        }
    }

    async reactivateStrategy(
        strategyName: string,
        auditUser: IAuditUser,
    ): Promise<void> {
        await this.strategyStore.get(strategyName); // Check existence
        await this.strategyStore.reactivateStrategy({ name: strategyName });
        await this.eventService.storeEvent(
            new StrategyReactivatedEvent({
                data: {
                    name: strategyName,
                },
                auditUser,
            }),
        );
    }

    async createStrategy(
        value: IMinimalStrategy,
        auditUser: IAuditUser,
    ): Promise<IStrategy | undefined> {
        this.assertCreationAllowed();
        const strategy = await strategySchema.validateAsync(value);
        strategy.deprecated = false;
        await this._validateStrategyName(strategy);
        await this.strategyStore.createStrategy(strategy);
        await this.eventService.storeEvent(
            new StrategyCreatedEvent({
                data: strategy,
                auditUser,
            }),
        );
        return this.strategyStore.get(strategy.name);
    }

    async updateStrategy(
        input: IMinimalStrategy,
        auditUser: IAuditUser,
    ): Promise<void> {
        this.assertEditingAllowed();
        const value = await strategySchema.validateAsync(input);
        const strategy = await this.strategyStore.get(input.name);
        await this._validateEditable(strategy);
        await this.strategyStore.updateStrategy(value);
        await this.eventService.storeEvent(
            new StrategyUpdatedEvent({
                data: value,
                auditUser,
            }),
        );
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
    _validateEditable(strategy: IStrategy | undefined): void {
        if (!strategy?.editable) {
            throw new Error(`Cannot edit strategy ${strategy?.name}`);
        }
    }

    private assertCreationAllowed(): void {
        if (this.customStrategySettings?.disableCreation) {
            throw new OperationDeniedError(
                'Custom strategy creation is disabled by configuration.',
            );
        }
    }

    private assertEditingAllowed(): void {
        if (this.customStrategySettings?.disableEditing) {
            throw new OperationDeniedError(
                'Custom strategy modification is disabled by configuration.',
            );
        }
    }
}
export default StrategyService;
