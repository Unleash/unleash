import type { IUnleashStores } from '../types/stores.js';
import type { IUnleashConfig } from '../types/option.js';
import type { Logger } from '../logger.js';
import type {
    IFeatureType,
    IFeatureTypeStore,
} from '../types/stores/feature-type-store.js';
import NotFoundError from '../error/notfound-error.js';
import type EventService from '../features/events/event-service.js';
import { FeatureTypeUpdatedEvent, type IAuditUser } from '../types/index.js';

export default class FeatureTypeService {
    private featureTypeStore: IFeatureTypeStore;

    private eventService: EventService;

    private logger: Logger;

    constructor(
        { featureTypeStore }: Pick<IUnleashStores, 'featureTypeStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
        eventService: EventService,
    ) {
        this.featureTypeStore = featureTypeStore;
        this.logger = getLogger('services/feature-type-service.ts');
        this.eventService = eventService;
    }

    async getAll(): Promise<IFeatureType[]> {
        return this.featureTypeStore.getAll();
    }

    async updateLifetime(
        id: string,
        newLifetimeDays: number | null,
        auditUser: IAuditUser,
    ): Promise<IFeatureType> {
        // because our OpenAPI library does type coercion, any `null` values you
        // pass in get converted to `0`.
        const translatedLifetime =
            newLifetimeDays === 0 ? null : newLifetimeDays;

        const featureType = await this.featureTypeStore.get(id);

        const result = await this.featureTypeStore.updateLifetime(
            id,
            translatedLifetime,
        );

        if (!featureType || !result) {
            throw new NotFoundError(
                `The feature type you tried to update ("${id}") does not exist.`,
            );
        }

        await this.eventService.storeEvent(
            new FeatureTypeUpdatedEvent({
                auditUser,
                data: { ...featureType, lifetimeDays: translatedLifetime },
                preData: featureType,
            }),
        );

        return result;
    }
}
