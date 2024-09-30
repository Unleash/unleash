import type { Logger } from '../../logger';
import type { IFlagResolver, IUnleashConfig } from '../../types';
import type {
    IntegrationEventsStore,
    IntegrationEventWriteModel,
} from './integration-events-store';
import type { IntegrationEventSchema } from '../../openapi/spec/integration-event-schema';

export class IntegrationEventsService {
    private readonly logger: Logger;
    private integrationEventsStore: IntegrationEventsStore;
    private flagResolver: IFlagResolver;

    constructor(
        {
            integrationEventsStore,
        }: { integrationEventsStore: IntegrationEventsStore },
        {
            getLogger,
            flagResolver,
        }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>,
    ) {
        this.integrationEventsStore = integrationEventsStore;
        this.flagResolver = flagResolver;
        this.logger = getLogger('integration-events-service');
    }

    async getPaginatedEvents(
        id: number,
        limit: number,
        offset: number,
    ): Promise<IntegrationEventSchema[]> {
        return this.integrationEventsStore.getPaginatedEvents(
            id,
            limit,
            offset,
        );
    }

    async registerEvent(
        integrationEvent: IntegrationEventWriteModel,
    ): Promise<IntegrationEventSchema> {
        return this.integrationEventsStore.insert(integrationEvent);
    }

    async cleanUpEvents(): Promise<void> {
        await this.integrationEventsStore.cleanUpEvents();
    }
}
