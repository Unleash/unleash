import { FEATURE_CREATED, type IEventStore } from '../../types';
import type {
    IFeatureLifecycleStore,
    LifecycleView,
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
    }

    async getFeatureLifecycle(feature: string): Promise<LifecycleView> {
        return this.featureLifecycleStore.get(feature);
    }

    async featureInitialized(feature: string) {
        await this.featureLifecycleStore.insert({ feature, stage: 'initial' });
    }

    async featureWentPreLive(featureName: string) {}
    async featureWentLive(featureName: string) {}
    async featureCompleted(featureName: string) {}
    async featureArchived(featureName: string) {}
}
