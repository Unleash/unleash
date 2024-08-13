import {
    CLIENT_METRICS_ADDED,
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
    NewStage,
} from './feature-lifecycle-store-type';
import type EventEmitter from 'events';
import type { Logger } from '../../logger';
import type EventService from '../events/event-service';
import type { FeatureLifecycleCompletedSchema } from '../../openapi';
import type { IClientMetricsEnv } from '../metrics/client-metrics/client-metrics-store-v2-type';
import groupBy from 'lodash.groupby';
import { STAGE_ENTERED } from '../../metric-events';

export class FeatureLifecycleService {
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

    listen() {
        this.featureLifecycleStore.backfill();
        this.eventStore.on(FEATURE_CREATED, async (event) => {
            await this.featureInitialized(event.featureName);
        });
        this.eventBus.on(
            CLIENT_METRICS_ADDED,
            async (events: IClientMetricsEnv[]) => {
                if (events.length > 0) {
                    const groupedByEnvironment = groupBy(events, 'environment');

                    for (const [environment, metrics] of Object.entries(
                        groupedByEnvironment,
                    )) {
                        const features = metrics.map(
                            (metric) => metric.featureName,
                        );
                        await this.featuresReceivedMetrics(
                            features,
                            environment,
                        );
                    }
                }
            },
        );
        this.eventStore.on(FEATURE_ARCHIVED, async (event) => {
            await this.featureArchived(event.featureName);
        });
        this.eventStore.on(FEATURE_REVIVED, async (event) => {
            await this.featureRevived(event.featureName);
        });
    }

    async getFeatureLifecycle(feature: string): Promise<FeatureLifecycleView> {
        return this.featureLifecycleStore.get(feature);
    }

    private async featureInitialized(feature: string) {
        const result = await this.featureLifecycleStore.insert([
            { feature, stage: 'initial' },
        ]);
        this.recordStagesEntered(result);
    }

    private async stageReceivedMetrics(
        features: string[],
        stage: 'live' | 'pre-live',
    ) {
        const newlyEnteredStages = await this.featureLifecycleStore.insert(
            features.map((feature) => ({ feature, stage })),
        );
        this.recordStagesEntered(newlyEnteredStages);
    }

    private recordStagesEntered(newlyEnteredStages: NewStage[]) {
        newlyEnteredStages.forEach(({ stage, feature }) => {
            this.eventBus.emit(STAGE_ENTERED, { stage, feature });
        });
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
                const featureEnv =
                    await this.featureEnvironmentStore.getAllByFeatures(
                        features,
                        env.name,
                    );
                const enabledFeatures = featureEnv
                    .filter((feature) => feature.enabled)
                    .map((feature) => feature.featureName);
                await this.stageReceivedMetrics(enabledFeatures, 'live');
            }
        } catch (e) {
            this.logger.warn(
                `Error handling ${features.length} metrics in ${environment}`,
                e,
            );
        }
    }

    public async featureCompleted(
        feature: string,
        projectId: string,
        status: FeatureLifecycleCompletedSchema,
        auditUser: IAuditUser,
    ) {
        const result = await this.featureLifecycleStore.insert([
            {
                feature,
                stage: 'completed',
                status: status.status,
                statusValue: status.statusValue,
            },
        ]);
        this.recordStagesEntered(result);
        await this.eventService.storeEvent(
            new FeatureCompletedEvent({
                project: projectId,
                featureName: feature,
                data: { ...status, kept: status.status === 'kept' },
                auditUser,
            }),
        );
    }

    public async featureUncompleted(
        feature: string,
        projectId: string,
        auditUser: IAuditUser,
    ) {
        await this.featureLifecycleStore.deleteStage({
            feature,
            stage: 'completed',
        });
        await this.eventService.storeEvent(
            new FeatureUncompletedEvent({
                project: projectId,
                featureName: feature,
                auditUser,
            }),
        );
    }

    private async featureArchived(feature: string) {
        const result = await this.featureLifecycleStore.insert([
            { feature, stage: 'archived' },
        ]);
        this.recordStagesEntered(result);
    }

    private async featureRevived(feature: string) {
        await this.featureLifecycleStore.delete(feature);
        await this.featureInitialized(feature);
    }
}
