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

    async featureReceivedMetrics(feature: string, environment: string) {
        const env = await this.environmentStore.get(environment);
        if (!env) {
            return;
        }
        if (env.type === 'production') {
            const stageExists = await this.featureLifecycleStore.stageExists({
                stage: 'live',
                feature,
            });
            if (!stageExists) {
                await this.featureWentLive(feature);
            }
        } else if (env.type === 'development') {
            const stageExists = await this.featureLifecycleStore.stageExists({
                stage: 'pre-live',
                feature,
            });
            if (!stageExists) {
                await this.featureWentPreLive(feature);
            }
        }
    }

    async featureWentPreLive(feature: string) {
        await this.featureLifecycleStore.insert({ feature, stage: 'pre-live' });
    }

    async featureWentLive(feature: string) {
        await this.featureLifecycleStore.insert({ feature, stage: 'live' });
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
