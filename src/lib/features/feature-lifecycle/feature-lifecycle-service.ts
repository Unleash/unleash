import {
    CLIENT_METRICS_ADDED,
    FEATURE_ARCHIVED,
    FEATURE_CREATED,
    FEATURE_REVIVED,
} from '../../events/index.js';
import {
    FeatureCompletedEvent,
    FeatureUncompletedEvent,
    type IAuditUser,
    type IEnvironment,
    type IEnvironmentStore,
    type IEventStore,
    type IFeatureEnvironment,
    type IFeatureEnvironmentStore,
    type IFlagResolver,
    type IUnleashConfig,
} from '../../types/index.js';
import type {
    FeatureLifecycleView,
    IFeatureLifecycleStore,
    NewStage,
} from './feature-lifecycle-store-type.js';
import type EventEmitter from 'events';
import type { Logger } from '../../logger.js';
import type EventService from '../events/event-service.js';
import type { FeatureLifecycleCompletedSchema } from '../../openapi/index.js';
import type { IClientMetricsEnv } from '../metrics/client-metrics/client-metrics-store-v2-type.js';
import groupBy from 'lodash.groupby';
import { STAGE_ENTERED } from '../../metric-events.js';

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
        this.eventStore.on(FEATURE_CREATED, async (event) => {
            await this.featureInitialized(event.featureName);
        });
        this.eventBus.on(
            CLIENT_METRICS_ADDED,
            async (events: IClientMetricsEnv[]) => {
                if (events.length > 0) {
                    if (this.flagResolver.isEnabled('optimizeLifecycle')) {
                        await this.handleBulkMetrics(events);
                    } else {
                        const groupedByEnvironment = groupBy(
                            events,
                            'environment',
                        );

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

    /**
     * Optimized bulk processing: reduces DB calls from O(4 * environments) to O(3) by batching all data fetches and processing in-memory
     */
    private async handleBulkMetrics(events: IClientMetricsEnv[]) {
        try {
            const { environments, allFeatures } =
                this.extractUniqueEnvironmentsAndFeatures(events);
            const envMap = await this.buildEnvironmentMap();
            const featureEnvMap =
                await this.buildFeatureEnvironmentMap(allFeatures);
            const allStagesToInsert = this.determineLifecycleStages(
                events,
                environments,
                envMap,
                featureEnvMap,
            );

            if (allStagesToInsert.length > 0) {
                const newlyEnteredStages =
                    await this.featureLifecycleStore.insert(allStagesToInsert);
                this.recordStagesEntered(newlyEnteredStages);
            }
        } catch (e) {
            this.logger.warn(
                `Error handling bulk metrics for ${events.length} events`,
                e,
            );
        }
    }

    private extractUniqueEnvironmentsAndFeatures(events: IClientMetricsEnv[]) {
        const environments = [...new Set(events.map((e) => e.environment))];
        const allFeatures = [...new Set(events.map((e) => e.featureName))];
        return { environments, allFeatures };
    }

    private async buildEnvironmentMap(): Promise<Map<string, IEnvironment>> {
        const allEnvs = await this.environmentStore.getAll();
        return new Map(allEnvs.map((env) => [env.name, env]));
    }

    private async buildFeatureEnvironmentMap(allFeatures: string[]) {
        const allFeatureEnvs =
            await this.featureEnvironmentStore.getAllByFeatures(allFeatures);
        const featureEnvMap = new Map<
            string,
            Map<string, IFeatureEnvironment>
        >();

        allFeatureEnvs.forEach((fe) => {
            if (!featureEnvMap.has(fe.environment)) {
                featureEnvMap.set(fe.environment, new Map());
            }
            const envMap = featureEnvMap.get(fe.environment);
            if (envMap) {
                envMap.set(fe.featureName, fe);
            }
        });

        return featureEnvMap;
    }

    private determineLifecycleStages(
        events: IClientMetricsEnv[],
        environments: string[],
        envMap: Map<string, IEnvironment>,
        featureEnvMap: Map<string, Map<string, IFeatureEnvironment>>,
    ): Array<{ feature: string; stage: 'pre-live' | 'live' }> {
        const allStagesToInsert: Array<{
            feature: string;
            stage: 'pre-live' | 'live';
        }> = [];

        for (const environment of environments) {
            const env = envMap.get(environment);
            if (!env) continue;

            const envFeatures = this.getFeaturesForEnvironment(
                events,
                environment,
            );
            allStagesToInsert.push(...this.createPreLiveStages(envFeatures));

            if (env.type === 'production') {
                const enabledFeatures = this.getEnabledFeaturesForEnvironment(
                    envFeatures,
                    environment,
                    featureEnvMap,
                );
                allStagesToInsert.push(
                    ...this.createLiveStages(enabledFeatures),
                );
            }
        }

        return allStagesToInsert;
    }

    private getFeaturesForEnvironment(
        events: IClientMetricsEnv[],
        environment: string,
    ): string[] {
        return events
            .filter((e) => e.environment === environment)
            .map((e) => e.featureName);
    }

    private createPreLiveStages(
        features: string[],
    ): Array<{ feature: string; stage: 'pre-live' }> {
        return features.map((feature) => ({
            feature,
            stage: 'pre-live' as const,
        }));
    }

    private createLiveStages(
        features: string[],
    ): Array<{ feature: string; stage: 'live' }> {
        return features.map((feature) => ({ feature, stage: 'live' as const }));
    }

    private getEnabledFeaturesForEnvironment(
        features: string[],
        environment: string,
        featureEnvMap: Map<string, Map<string, IFeatureEnvironment>>,
    ): string[] {
        const envFeatureEnvs = featureEnvMap.get(environment) ?? new Map();
        return features.filter((feature) => {
            const fe = envFeatureEnvs.get(feature);
            return fe?.enabled;
        });
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
