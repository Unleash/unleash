import {
    CLIENT_METRICS,
    FEATURE_ARCHIVED,
    FEATURE_COMPLETED,
    FEATURE_CREATED,
    type IEnvironmentStore,
    type IEventStore,
} from '../../types';
import type {
    FeatureLifecycleView,
    IFeatureLifecycleStore,
} from './feature-lifecycle-store-type';

export class FeatureLifecycleService {
    private eventStore: IEventStore;

    private featureLifecycleStore: IFeatureLifecycleStore;

    private environmentStore: IEnvironmentStore;

    constructor({
        eventStore,
        featureLifecycleStore,
        environmentStore,
    }: {
        eventStore: IEventStore;
        environmentStore: IEnvironmentStore;
        featureLifecycleStore: IFeatureLifecycleStore;
    }) {
        this.eventStore = eventStore;
        this.featureLifecycleStore = featureLifecycleStore;
        this.environmentStore = environmentStore;
    }

    listen() {
        this.eventStore.on(FEATURE_CREATED, async (event) => {
            await this.featureInitialized(event.featureName);
        });
        this.eventStore.on(CLIENT_METRICS, async (event) => {
            await this.featureReceivedMetrics(
                event.featureName,
                event.environment,
            );
        });
        this.eventStore.on(FEATURE_COMPLETED, async (event) => {
            await this.featureCompleted(event.featureName);
        });
        this.eventStore.on(FEATURE_ARCHIVED, async (event) => {
            await this.featureArchived(event.featureName);
        });
    }

    async getFeatureLifecycle(feature: string): Promise<FeatureLifecycleView> {
        return this.featureLifecycleStore.get(feature);
    }

    async featureInitialized(feature: string) {
        await this.featureLifecycleStore.insert({ feature, stage: 'initial' });
    }

    async stageReceivedMetrics(feature: string, stage: 'live' | 'pre-live') {
        const stageExists = await this.featureLifecycleStore.stageExists({
            stage,
            feature,
        });
        if (!stageExists) {
            await this.featureLifecycleStore.insert({ feature, stage });
        }
    }

    async featureReceivedMetrics(feature: string, environment: string) {
        const env = await this.environmentStore.get(environment);
        if (!env) {
            return;
        }
        if (env.type === 'production') {
            await this.stageReceivedMetrics(feature, 'live');
        } else if (env.type === 'development') {
            await this.stageReceivedMetrics(feature, 'pre-live');
        }
    }

    async featureCompleted(feature: string) {
        await this.featureLifecycleStore.insert({
            feature,
            stage: 'completed',
        });
    }

    async featureArchived(feature: string) {
        await this.featureLifecycleStore.insert({ feature, stage: 'archived' });
    }
}
