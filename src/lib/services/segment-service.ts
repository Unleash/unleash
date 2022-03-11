import { IUnleashConfig } from '../types/option';
import { IEventStore } from '../types/stores/event-store';
import { IUnleashStores } from '../types';
import { Logger } from '../logger';
import { ISegmentStore } from '../types/stores/segment-store';
import { IFeatureStrategy, ISegment } from '../types/model';
import { savedSegmentSchema, unsavedSegmentSchema } from './segment-schema';
import {
    SEGMENT_CREATED,
    SEGMENT_DELETED,
    SEGMENT_UPDATED,
} from '../types/events';
import User from '../types/user';
import { IFeatureStrategiesStore } from '../types/stores/feature-strategies-store';

export class SegmentService {
    private logger: Logger;

    private segmentStore: ISegmentStore;

    private featureStrategiesStore: IFeatureStrategiesStore;

    private eventStore: IEventStore;

    constructor(
        {
            segmentStore,
            featureStrategiesStore,
            eventStore,
        }: Pick<
            IUnleashStores,
            'segmentStore' | 'featureStrategiesStore' | 'eventStore'
        >,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.segmentStore = segmentStore;
        this.featureStrategiesStore = featureStrategiesStore;
        this.eventStore = eventStore;
        this.logger = getLogger('services/segment-service.ts');
    }

    async getAll(): Promise<ISegment[]> {
        return this.segmentStore.getAll();
    }

    async getByStrategy(strategyId: string): Promise<ISegment[]> {
        return this.segmentStore.getByStrategy(strategyId);
    }

    async getActive(): Promise<ISegment[]> {
        return this.segmentStore.getActive();
    }

    async create(data: unknown, user: User): Promise<void> {
        const input = await unsavedSegmentSchema.validateAsync(data);
        const segment = await this.segmentStore.create(input, user);

        await this.eventStore.store({
            type: SEGMENT_CREATED,
            createdBy: user.email || user.username,
            data: segment,
        });
    }

    async update(data: unknown, user: User): Promise<void> {
        const input = await savedSegmentSchema.validateAsync(data);
        const preData = this.segmentStore.get(input.id);
        const segment = await this.segmentStore.update(input);

        await this.segmentStore.update(segment);
        await this.eventStore.store({
            type: SEGMENT_UPDATED,
            createdBy: user.email || user.username,
            data: segment,
            preData,
        });
    }

    async delete(id: number, user: User): Promise<void> {
        const segment = this.segmentStore.get(id);
        await this.segmentStore.delete(id);
        await this.eventStore.store({
            type: SEGMENT_DELETED,
            createdBy: user.email || user.username,
            data: segment,
        });
    }

    async getStrategies(id: number): Promise<IFeatureStrategy[]> {
        return this.featureStrategiesStore.getStrategiesBySegment(id);
    }

    async addToStrategy(id: number, strategyId: string): Promise<void> {
        await this.segmentStore.addToStrategy(id, strategyId);
    }

    async removeFromStrategy(id: number, strategyId: string): Promise<void> {
        await this.segmentStore.removeFromStrategy(id, strategyId);
    }
}
