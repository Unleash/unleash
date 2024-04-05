import {
    CLIENT_METRICS,
    FEATURE_ARCHIVED,
    FEATURE_COMPLETED,
    FEATURE_CREATED,
    type IEnvironmentStore,
    type IEventStore,
    type IFlagResolver,
    type IUnleashConfig,
} from '../../types';
import type {
    FeatureLifecycleView,
    IFeatureLifecycleStore,
} from './feature-lifecycle-store-type';
import type EventEmitter from 'events';

export class FeatureLifecycleService {
    private eventStore: IEventStore;

    private featureLifecycleStore: IFeatureLifecycleStore;

    private environmentStore: IEnvironmentStore;

    private flagResolver: IFlagResolver;

    private eventBus: EventEmitter;

    constructor(
        {
            eventStore,
            featureLifecycleStore,
            environmentStore,
        }: {
            eventStore: IEventStore;
            environmentStore: IEnvironmentStore;
            featureLifecycleStore: IFeatureLifecycleStore;
        },
        {
            flagResolver,
            eventBus,
        }: Pick<IUnleashConfig, 'flagResolver' | 'eventBus'>,
    ) {
        this.eventStore = eventStore;
        this.featureLifecycleStore = featureLifecycleStore;
        this.environmentStore = environmentStore;
        this.flagResolver = flagResolver;
        this.eventBus = eventBus;
    }

    private async checkEnabled(fn: () => Promise<void>) {
        const enabled = this.flagResolver.isEnabled('featureLifecycle');
        if (enabled) {
            return fn();
        }
    }

    listen() {
        this.eventStore.on(FEATURE_CREATED, async (event) => {
            await this.checkEnabled(() =>
                this.featureInitialized(event.featureName),
            );
        });
        this.eventBus.on(CLIENT_METRICS, async (event) => {
            await this.checkEnabled(() =>
                this.featureReceivedMetrics(
                    event.featureName,
                    event.environment,
                ),
            );
        });
        this.eventStore.on(FEATURE_COMPLETED, async (event) => {
            await this.checkEnabled(() =>
                this.featureCompleted(event.featureName),
            );
        });
        this.eventStore.on(FEATURE_ARCHIVED, async (event) => {
            await this.checkEnabled(() =>
                this.featureArchived(event.featureName),
            );
        });
    }

    async getFeatureLifecycle(feature: string): Promise<FeatureLifecycleView> {
        return this.featureLifecycleStore.get(feature);
    }

    private async featureInitialized(feature: string) {
        await this.featureLifecycleStore.insert({ feature, stage: 'initial' });
    }

    private async stageReceivedMetrics(
        feature: string,
        stage: 'live' | 'pre-live',
    ) {
        const stageExists = await this.featureLifecycleStore.stageExists({
            stage,
            feature,
        });
        if (!stageExists) {
            await this.featureLifecycleStore.insert({ feature, stage });
        }
    }

    private async featureReceivedMetrics(feature: string, environment: string) {
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

    private async featureCompleted(feature: string) {
        await this.featureLifecycleStore.insert({
            feature,
            stage: 'completed',
        });
    }

    private async featureArchived(feature: string) {
        await this.featureLifecycleStore.insert({ feature, stage: 'archived' });
    }
}
