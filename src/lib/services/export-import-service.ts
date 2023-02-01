import { IUnleashConfig } from '../types/option';
import { IFeatureStrategy, IFeatureStrategySegment } from '../types/model';
import { Logger } from '../logger';
import { IFeatureTagStore } from '../types/stores/feature-tag-store';
import { IProjectStore } from '../types/stores/project-store';
import { ITagTypeStore } from '../types/stores/tag-type-store';
import { ITagStore } from '../types/stores/tag-store';
import { IEventStore } from '../types/stores/event-store';
import { IStrategyStore } from '../types/stores/strategy-store';
import { IFeatureToggleStore } from '../types/stores/feature-toggle-store';
import { IFeatureStrategiesStore } from '../types/stores/feature-strategies-store';
import { IEnvironmentStore } from '../types/stores/environment-store';
import { IFeatureEnvironmentStore } from '../types/stores/feature-environment-store';
import { IContextFieldStore, IUnleashStores } from '../types/stores';
import { ISegmentStore } from '../types/stores/segment-store';
import FeatureToggleService from './feature-toggle-service';
import { ExportQuerySchema } from '../openapi/spec/export-query-schema';
import { FEATURES_EXPORTED, IFlagResolver, IUnleashServices } from '../types';
import { ExportResultSchema } from '../openapi';

export default class ExportImportService {
    private logger: Logger;

    private toggleStore: IFeatureToggleStore;

    private featureStrategiesStore: IFeatureStrategiesStore;

    private strategyStore: IStrategyStore;

    private eventStore: IEventStore;

    private tagStore: ITagStore;

    private tagTypeStore: ITagTypeStore;

    private projectStore: IProjectStore;

    private featureEnvironmentStore: IFeatureEnvironmentStore;

    private featureTagStore: IFeatureTagStore;

    private environmentStore: IEnvironmentStore;

    private segmentStore: ISegmentStore;

    private flagResolver: IFlagResolver;

    private featureToggleService: FeatureToggleService;

    private contextFieldStore: IContextFieldStore;

    constructor(
        stores: IUnleashStores,
        {
            getLogger,
            flagResolver,
        }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>,
        {
            featureToggleService,
        }: Pick<IUnleashServices, 'featureToggleService'>,
    ) {
        this.eventStore = stores.eventStore;
        this.toggleStore = stores.featureToggleStore;
        this.strategyStore = stores.strategyStore;
        this.tagStore = stores.tagStore;
        this.featureStrategiesStore = stores.featureStrategiesStore;
        this.featureEnvironmentStore = stores.featureEnvironmentStore;
        this.tagTypeStore = stores.tagTypeStore;
        this.projectStore = stores.projectStore;
        this.featureTagStore = stores.featureTagStore;
        this.environmentStore = stores.environmentStore;
        this.segmentStore = stores.segmentStore;
        this.flagResolver = flagResolver;
        this.featureToggleService = featureToggleService;
        this.contextFieldStore = stores.contextFieldStore;
        this.logger = getLogger('services/state-service.js');
    }

    async export(
        query: ExportQuerySchema,
        userName: string,
    ): Promise<ExportResultSchema> {
        const [
            features,
            featureEnvironments,
            featureStrategies,
            strategySegments,
            contextFields,
            featureTags,
            segments,
            tagTypes,
        ] = await Promise.all([
            this.toggleStore.getAllByNames(query.features),
            await this.featureEnvironmentStore.getAllByFeatures(
                query.features,
                query.environment,
            ),
            this.featureStrategiesStore.getAllByFeatures(
                query.features,
                query.environment,
            ),
            this.segmentStore.getAllFeatureStrategySegments(),
            this.contextFieldStore.getAll(),
            this.featureTagStore.getAllByFeatures(query.features),
            this.segmentStore.getAll(),
            this.tagTypeStore.getAll(),
        ]);
        this.addSegmentsToStrategies(featureStrategies, strategySegments);
        const filteredContextFields = contextFields.filter((field) =>
            featureStrategies.some((strategy) =>
                strategy.constraints.some(
                    (constraint) => constraint.contextName === field.name,
                ),
            ),
        );
        const filteredSegments = segments.filter((segment) =>
            featureStrategies.some((strategy) =>
                strategy.segments.includes(segment.id),
            ),
        );
        const filteredTagTypes = tagTypes.filter((tagType) =>
            featureTags.map((tag) => tag.tagType).includes(tagType.name),
        );
        const result = {
            features: features.map((item) => {
                const { createdAt, archivedAt, lastSeenAt, ...rest } = item;
                return rest;
            }),
            featureStrategies: featureStrategies.map((item) => {
                const name = item.strategyName;
                const {
                    createdAt,
                    projectId,
                    environment,
                    strategyName,
                    ...rest
                } = item;
                return {
                    name,
                    ...rest,
                };
            }),
            featureEnvironments: featureEnvironments.map((item) => ({
                ...item,
                name: item.featureName,
            })),
            contextFields: filteredContextFields.map((item) => {
                const { createdAt, ...rest } = item;
                return rest;
            }),
            featureTags,
            segments: filteredSegments.map((item) => {
                const { createdAt, createdBy, ...rest } = item;
                return rest;
            }),
            tagTypes: filteredTagTypes,
        };
        await this.eventStore.store({
            type: FEATURES_EXPORTED,
            createdBy: userName,
            data: result,
        });

        return result;
    }

    addSegmentsToStrategies(
        featureStrategies: IFeatureStrategy[],
        strategySegments: IFeatureStrategySegment[],
    ): void {
        featureStrategies.forEach((featureStrategy) => {
            featureStrategy.segments = strategySegments
                .filter(
                    (segment) =>
                        segment.featureStrategyId === featureStrategy.id,
                )
                .map((segment) => segment.segmentId);
        });
    }
}

module.exports = ExportImportService;
