import ky from 'ky';
import { addonDefinitionSchema } from './addon-schema.js';
import type { Logger } from '../logger.js';
import type { IAddonConfig, IAddonDefinition } from '../types/model.js';
import type { IEvent } from '../events/index.js';
import type { IntegrationEventsService } from '../features/integration-events/integration-events-service.js';
import type { IntegrationEventWriteModel } from '../features/integration-events/integration-events-store.js';
import type EventEmitter from 'events';
import type { IFlagResolver } from '../types/index.js';
import { ADDON_EVENTS_HANDLED } from '../metric-events.js';

export default abstract class Addon {
    logger: Logger;

    _name: string;

    _definition: IAddonDefinition;

    integrationEventsService: IntegrationEventsService;

    eventBus: EventEmitter;

    flagResolver: IFlagResolver;

    constructor(
        definition: IAddonDefinition,
        {
            getLogger,
            integrationEventsService,
            flagResolver,
            eventBus,
        }: IAddonConfig,
    ) {
        this.logger = getLogger(`addon/${definition.name}`);
        const { error } = addonDefinitionSchema.validate(definition);
        if (error) {
            this.logger.warn(
                `Could not load addon provider ${definition.name}`,
                error,
            );
            throw error;
        }
        this._name = definition.name;
        this._definition = definition;
        this.integrationEventsService = integrationEventsService;
        this.eventBus = eventBus;
        this.flagResolver = flagResolver;
    }

    get name(): string {
        return this._name;
    }

    get definition(): IAddonDefinition {
        return this._definition;
    }

    async fetchRetry(
        url: string,
        options: any = {},
        retries: number = 1,
    ): Promise<Response> {
        try {
            const res = await ky(url, {
                retry: retries,
                ...options,
            });
            return res;
        } catch (e) {
            const { method } = options;
            this.logger.warn(
                `Error querying ${url} with method ${
                    method || 'GET'
                } status code ${e.code}`,
                e,
            );
            return { status: e.code, ok: false } as Response;
        }
    }

    abstract handleEvent(
        event: IEvent,
        parameters: any,
        integrationId: number,
    ): Promise<void>;

    async registerEvent(
        integrationEvent: IntegrationEventWriteModel,
    ): Promise<void> {
        await this.integrationEventsService.registerEvent(integrationEvent);
        this.eventBus.emit(ADDON_EVENTS_HANDLED, {
            result: integrationEvent.state,
            destination: this.name,
        });
    }

    destroy?(): void;
}
