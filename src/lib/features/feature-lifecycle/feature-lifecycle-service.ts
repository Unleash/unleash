import {
    CLIENT_METRICS,
    FEATURE_ARCHIVED,
    FEATURE_CREATED,
    FEATURE_REVIVED,
    FeatureCompletedEvent,
    FeatureUncompletedEvent,
    type IAuditUser,
    type IEnvironmentStore,
    type IEventStore,
    type IFeatureEnvironmentStore,
    type IFlagResolver,
    type IUnleashConfig,
} from '../../types';
import type {
    FeatureLifecycleView,
    IFeatureLifecycleStore,
} from './feature-lifecycle-store-type';
import EventEmitter from 'events';
import type { Logger } from '../../logger';
import type EventService from '../events/event-service';
import type { ValidatedClientMetrics } from '../metrics/shared/schema';

export const STAGE_ENTERED = 'STAGE_ENTERED';

export class FeatureLifecycleService extends EventEmitter {
    private eventStore: IEventStore;

    private featureLifecycleStore: IFeatureLifecycleStore;

    private environmentStore: IEnvironmentStore;

    private featureEnvironmentStore: IFeatureEnvironmentStore;

    private flagResolver: IFlagResolver;

    private eventBus: EventEmitter;

    private eventService: EventService;

    private logger: Logger;

    constructor(
        {
            eventStore,
            featureLifecycleStore,
            environmentStore,
            featureEnvironmentStore,
        }: {
            eventStore: IEventStore;
            environmentStore: IEnvironmentStore;
            featureLifecycleStore: IFeatureLifecycleStore;
            featureEnvironmentStore: IFeatureEnvironmentStore;
        },
        {
            eventService,
        }: {
            eventService: EventService;
        },
        {
            flagResolver,
            eventBus,
            getLogger,
        }: Pick<IUnleashConfig, 'flagResolver' | 'eventBus' | 'getLogger'>,
    ) {
        super();
        this.eventStore = eventStore;
        this.featureLifecycleStore = featureLifecycleStore;
        this.environmentStore = environmentStore;
        this.featureEnvironmentStore = featureEnvironmentStore;
        this.flagResolver = flagResolver;
        this.eventBus = eventBus;
        this.eventService = eventService;
        this.logger = getLogger(
            'feature-lifecycle/feature-lifecycle-service.ts',
        );
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
        this.eventBus.on(
            CLIENT_METRICS,
            async (event: ValidatedClientMetrics) => {
                if (event.environment) {
                    const features = Object.keys(event.bucket.toggles);
                    const environment = event.environment;
                    await this.checkEnabled(() =>
                        this.featuresReceivedMetrics(features, environment),
                    );
                }
            },
        );
        this.eventStore.on(FEATURE_ARCHIVED, async (event) => {
            await this.checkEnabled(() =>
                this.featureArchived(event.featureName),
            );
        });
        this.eventStore.on(FEATURE_REVIVED, async (event) => {
            await this.checkEnabled(() =>
                this.featureRevived(event.featureName),
            );
        });
    }

    async getFeatureLifecycle(feature: string): Promise<FeatureLifecycleView> {
        return this.featureLifecycleStore.get(feature);
    }

    private async featureInitialized(feature: string) {
        await this.featureLifecycleStore.insert([
            { feature, stage: 'initial' },
        ]);
        this.emit(STAGE_ENTERED, { stage: 'initial' });
    }

    private async stageReceivedMetrics(
        features: string[],
        stage: 'live' | 'pre-live',
    ) {
        await this.featureLifecycleStore.insert(
            features.map((feature) => ({ feature, stage })),
        );
        this.emit(STAGE_ENTERED, { stage });
    }

    private async featuresReceivedMetrics(
        features: string[],
        environment: string,
    ) {
        try {
            const env = await this.environmentStore.get(environment);

            if (!env) {
                return;
            }
            await this.stageReceivedMetrics(features, 'pre-live');
            if (env.type === 'production') {
                const envFeatures =
                    await this.featureEnvironmentStore.getAllByFeatures(
                        features,
                        env.name,
                    );
                const enabledFeatures = envFeatures
                    .filter((envFeature) => envFeature.enabled)
                    .map((envFeature) => envFeature.featureName);
                await this.stageReceivedMetrics(enabledFeatures, 'live');
            }
        } catch (e) {
            this.logger.warn(
                `Error handling ${features.length} metrics in ${environment}`,
                e,
            );
        }
    }

    public async featureCompleted(feature: string, auditUser: IAuditUser) {
        await this.featureLifecycleStore.insert([
            {
                feature,
                stage: 'completed',
            },
        ]);
        await this.eventService.storeEvent(
            new FeatureCompletedEvent({
                featureName: feature,
                auditUser,
            }),
        );
    }

    public async featureUnCompleted(feature: string, auditUser: IAuditUser) {
        await this.featureLifecycleStore.deleteStage({
            feature,
            stage: 'completed',
        });
        await this.eventService.storeEvent(
            new FeatureUncompletedEvent({
                featureName: feature,
                auditUser,
            }),
        );
    }

    private async featureArchived(feature: string) {
        await this.featureLifecycleStore.insert([
            { feature, stage: 'archived' },
        ]);
        this.emit(STAGE_ENTERED, { stage: 'archived' });
    }

    private async featureRevived(feature: string) {
        await this.featureLifecycleStore.delete(feature);
        await this.featureInitialized(feature);
    }
}
