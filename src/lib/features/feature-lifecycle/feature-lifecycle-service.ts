import {
    FEATURE_ARCHIVED,
    FEATURE_CREATED,
    type IEventStore,
} from '../../types';
import type {
    IFeatureLifecycleStore,
    FeatureLifecycleView,
} from './feature-lifecycle-store-type';

export class FeatureLifecycleService {
    private eventStore: IEventStore;

    private featureLifecycleStore: IFeatureLifecycleStore;

    constructor({
        eventStore,
        featureLifecycleStore,
    }: {
        eventStore: IEventStore;
        featureLifecycleStore: IFeatureLifecycleStore;
    }) {
        this.eventStore = eventStore;
        this.featureLifecycleStore = featureLifecycleStore;
    }

    listen() {
        this.eventStore.on(FEATURE_CREATED, (event) => {
            this.featureInitialized(event.featureName);
        });
        this.eventStore.on(FEATURE_ARCHIVED, (event) => {
            this.featureArchived(event.featureName);
        });
    }

    async getFeatureLifecycle(feature: string): Promise<FeatureLifecycleView> {
        return this.featureLifecycleStore.get(feature);
    }

    async featureInitialized(feature: string) {
        await this.featureLifecycleStore.insert({ feature, stage: 'initial' });
    }

    async featureArchived(feature: string) {
        await this.featureLifecycleStore.insert({ feature, stage: 'archived' });
    }

    async featureWentPreLive(featureName: string) {}
    async featureWentLive(featureName: string) {}
    async featureCompleted(featureName: string) {}
}
