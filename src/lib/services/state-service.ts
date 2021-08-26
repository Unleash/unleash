import { stateSchema } from './state-schema';
import {
    DROP_FEATURE_TAGS,
    DROP_FEATURES,
    DROP_PROJECTS,
    DROP_STRATEGIES,
    DROP_TAG_TYPES,
    DROP_TAGS,
    FEATURE_IMPORT,
    FEATURE_TAG_IMPORT,
    PROJECT_IMPORT,
    STRATEGY_IMPORT,
    TAG_IMPORT,
    TAG_TYPE_IMPORT,
} from '../types/events';

import { filterEqual, filterExisting, parseFile, readFile } from './state-util';

import { IUnleashConfig } from '../types/option';
import {
    FeatureToggle,
    IEnvironment,
    IImportFile,
    IFeatureEnvironment,
    IFeatureStrategy,
    ITag,
    IImportData,
    IProject,
} from '../types/model';
import { GLOBAL_ENV } from '../types/environment';
import { Logger } from '../logger';
import {
    IFeatureTag,
    IFeatureTagStore,
} from '../types/stores/feature-tag-store';
import { IProjectStore } from '../types/stores/project-store';
import { ITagType, ITagTypeStore } from '../types/stores/tag-type-store';
import { ITagStore } from '../types/stores/tag-store';
import { IEventStore } from '../types/stores/event-store';
import { IStrategy, IStrategyStore } from '../types/stores/strategy-store';
import { IFeatureToggleStore } from '../types/stores/feature-toggle-store';
import { IFeatureStrategiesStore } from '../types/stores/feature-strategies-store';
import { IEnvironmentStore } from '../types/stores/environment-store';
import { IFeatureEnvironmentStore } from '../types/stores/feature-environment-store';
import { IUnleashStores } from '../types/stores';

export interface IBackupOption {
    includeFeatureToggles: boolean;
    includeStrategies: boolean;
    includeProjects: boolean;
    includeTags: boolean;
}

interface IExportIncludeOptions {
    includeFeatureToggles?: boolean;
    includeStrategies?: boolean;
    includeProjects?: boolean;
    includeTags?: boolean;
    includeEnvironments?: boolean;
}

export default class StateService {
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

    constructor(
        stores: IUnleashStores,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
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
        this.logger = getLogger('services/state-service.js');
    }

    async importFile({
        file,
        dropBeforeImport = false,
        userName = 'import-user',
        keepExisting = true,
    }: IImportFile): Promise<void> {
        return readFile(file)
            .then((data) => parseFile(file, data))
            .then((data) =>
                this.import({
                    data,
                    userName,
                    dropBeforeImport,
                    keepExisting,
                }),
            );
    }

    async import({
        data,
        userName = 'importUser',
        dropBeforeImport = false,
        keepExisting = true,
    }: IImportData): Promise<void> {
        const importData = await stateSchema.validateAsync(data);

        if (importData.features) {
            let projectData;
            if (!importData.version || importData.version === 1) {
                projectData = await this.convertLegacyFeatures(importData);
            } else {
                projectData = importData;
            }
            const { features, featureStrategies, featureEnvironments } =
                projectData;

            await this.importFeatures({
                features,
                userName,
                dropBeforeImport,
                keepExisting,
            });
            await this.importFeatureEnvironments({
                featureEnvironments,
            });
            await this.importFeatureStrategies({
                featureStrategies,
                dropBeforeImport,
                keepExisting,
            });
        }

        if (importData.strategies) {
            await this.importStrategies({
                strategies: data.strategies,
                userName,
                dropBeforeImport,
                keepExisting,
            });
        }

        if (importData.projects) {
            await this.importProjects({
                projects: data.projects,
                userName,
                dropBeforeImport,
                keepExisting,
            });
        }

        if (importData.tagTypes && importData.tags) {
            await this.importTagData({
                tagTypes: data.tagTypes,
                tags: data.tags,
                featureTags:
                    (data.featureTags || [])
                        .filter((t) =>
                            (data.features || []).some(
                                (f) => f.name === t.featureName,
                            ),
                        )
                        .map((t) => ({
                            featureName: t.featureName,
                            tagValue: t.tagValue || t.value,
                            tagType: t.tagType || t.type,
                        })) || [],
                userName,
                dropBeforeImport,
                keepExisting,
            });
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async importFeatureEnvironments({ featureEnvironments }): Promise<void> {
        await Promise.all(
            featureEnvironments.map((env) =>
                this.featureEnvironmentStore.connectEnvironmentAndFeature(
                    env.featureName,
                    env.environment,
                    env.enabled,
                ),
            ),
        );
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async importFeatureStrategies({
        featureStrategies,
        dropBeforeImport,
        keepExisting,
    }): Promise<void> {
        const oldFeatureStrategies = dropBeforeImport
            ? []
            : await this.featureStrategiesStore.getAllFeatureStrategies();
        if (dropBeforeImport) {
            this.logger.info(
                'Dropping existing strategies for feature toggles',
            );
            await this.featureStrategiesStore.deleteAll();
        }
        const strategiesToImport = keepExisting
            ? featureStrategies.filter(
                  (s) => !oldFeatureStrategies.some((o) => o.id === s.id),
              )
            : featureStrategies;
        await Promise.all(
            strategiesToImport.map((featureStrategy) =>
                this.featureStrategiesStore.createStrategyConfig(
                    featureStrategy,
                ),
            ),
        );
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async convertLegacyFeatures({
        features,
    }): Promise<{ features; featureStrategies; featureEnvironments }> {
        const strategies = features.flatMap((f) =>
            f.strategies.map((strategy) => ({
                featureName: f.name,
                projectName: f.project,
                constraints: strategy.constraints || [],
                parameters: strategy.parameters || {},
                environment: GLOBAL_ENV,
                strategyName: strategy.name,
            })),
        );
        const newFeatures = features;
        const featureEnvironments = features.map((feature) => ({
            featureName: feature.name,
            environment: GLOBAL_ENV,
            enabled: feature.enabled,
        }));
        return {
            features: newFeatures,
            featureStrategies: strategies,
            featureEnvironments,
        };
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async importFeatures({
        features,
        userName,
        dropBeforeImport,
        keepExisting,
    }): Promise<void> {
        this.logger.info(`Importing ${features.length} feature toggles`);
        const oldToggles = dropBeforeImport
            ? []
            : await this.toggleStore.getAll();

        if (dropBeforeImport) {
            this.logger.info('Dropping existing feature toggles');
            await this.toggleStore.deleteAll();
            await this.eventStore.store({
                type: DROP_FEATURES,
                createdBy: userName,
                data: { name: 'all-features' },
            });
        }

        await Promise.all(
            features
                .filter(filterExisting(keepExisting, oldToggles))
                .filter(filterEqual(oldToggles))
                .map((feature) =>
                    this.toggleStore
                        .createFeature(feature.project, feature)
                        .then(() => {
                            this.eventStore.store({
                                type: FEATURE_IMPORT,
                                createdBy: userName,
                                data: feature,
                            });
                        }),
                ),
        );
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async importStrategies({
        strategies,
        userName,
        dropBeforeImport,
        keepExisting,
    }): Promise<void> {
        this.logger.info(`Importing ${strategies.length} strategies`);
        const oldStrategies = dropBeforeImport
            ? []
            : await this.strategyStore.getAll();

        if (dropBeforeImport) {
            this.logger.info('Dropping existing strategies');
            await this.strategyStore.dropCustomStrategies();
            await this.eventStore.store({
                type: DROP_STRATEGIES,
                createdBy: userName,
                data: { name: 'all-strategies' },
            });
        }

        await Promise.all(
            strategies
                .filter(filterExisting(keepExisting, oldStrategies))
                .filter(filterEqual(oldStrategies))
                .map((strategy) =>
                    this.strategyStore.importStrategy(strategy).then(() => {
                        this.eventStore.store({
                            type: STRATEGY_IMPORT,
                            createdBy: userName,
                            data: strategy,
                        });
                    }),
                ),
        );
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async importProjects({
        projects,
        userName,
        dropBeforeImport,
        keepExisting,
    }): Promise<void> {
        this.logger.info(`Import ${projects.length} projects`);
        const oldProjects = dropBeforeImport
            ? []
            : await this.projectStore.getAll();
        if (dropBeforeImport) {
            this.logger.info('Dropping existing projects');
            await this.projectStore.deleteAll();
            await this.eventStore.store({
                type: DROP_PROJECTS,
                createdBy: userName,
                data: { name: 'all-projects' },
            });
        }
        const projectsToImport = projects.filter((project) =>
            keepExisting
                ? !oldProjects.some((old) => old.id === project.id)
                : true,
        );
        if (projectsToImport.length > 0) {
            const importedProjects = await this.projectStore.importProjects(
                projectsToImport,
            );
            const importedProjectEvents = importedProjects.map((project) => ({
                type: PROJECT_IMPORT,
                createdBy: userName,
                data: project,
            }));
            await this.eventStore.batchStore(importedProjectEvents);
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async importTagData({
        tagTypes,
        tags,
        featureTags,
        userName,
        dropBeforeImport,
        keepExisting,
    }): Promise<void> {
        this.logger.info(
            `Importing ${tagTypes.length} tagtypes, ${tags.length} tags and ${featureTags.length} feature tags`,
        );
        const oldTagTypes = dropBeforeImport
            ? []
            : await this.tagTypeStore.getAll();
        const oldTags = dropBeforeImport ? [] : await this.tagStore.getAll();
        const oldFeatureTags = dropBeforeImport
            ? []
            : await this.featureTagStore.getAll();
        if (dropBeforeImport) {
            this.logger.info(
                'Dropping all existing featuretags, tags and tagtypes',
            );
            await this.featureTagStore.deleteAll();
            await this.tagStore.deleteAll();
            await this.tagTypeStore.deleteAll();
            await this.eventStore.batchStore([
                {
                    type: DROP_FEATURE_TAGS,
                    createdBy: userName,
                    data: { name: 'all-feature-tags' },
                },
                {
                    type: DROP_TAGS,
                    createdBy: userName,
                    data: { name: 'all-tags' },
                },
                {
                    type: DROP_TAG_TYPES,
                    createdBy: userName,
                    data: { name: 'all-tag-types' },
                },
            ]);
        }
        await this.importTagTypes(
            tagTypes,
            keepExisting,
            oldTagTypes,
            userName,
        );
        await this.importTags(tags, keepExisting, oldTags, userName);
        await this.importFeatureTags(
            featureTags,
            keepExisting,
            oldFeatureTags,
            userName,
        );
    }

    compareFeatureTags: (old: IFeatureTag, tag: IFeatureTag) => boolean = (
        old,
        tag,
    ) =>
        old.featureName === tag.featureName &&
        old.tagValue === tag.tagValue &&
        old.tagType === tag.tagType;

    async importFeatureTags(
        featureTags: IFeatureTag[],
        keepExisting: boolean,
        oldFeatureTags: IFeatureTag[],
        userName: string,
    ): Promise<void> {
        const featureTagsToInsert = featureTags.filter((tag) =>
            keepExisting
                ? !oldFeatureTags.some((old) =>
                      this.compareFeatureTags(old, tag),
                  )
                : true,
        );
        if (featureTagsToInsert.length > 0) {
            const importedFeatureTags =
                await this.featureTagStore.importFeatureTags(
                    featureTagsToInsert,
                );
            const importedFeatureTagEvents = importedFeatureTags.map((tag) => ({
                type: FEATURE_TAG_IMPORT,
                createdBy: userName,
                data: tag,
            }));
            await this.eventStore.batchStore(importedFeatureTagEvents);
        }
    }

    compareTags = (old: ITag, tag: ITag): boolean =>
        old.type === tag.type && old.value === tag.value;

    async importTags(
        tags: ITag[],
        keepExisting: boolean,
        oldTags: ITag[],
        userName: string,
    ): Promise<void> {
        const tagsToInsert = tags.filter((tag) =>
            keepExisting
                ? !oldTags.some((old) => this.compareTags(old, tag))
                : true,
        );
        if (tagsToInsert.length > 0) {
            const importedTags = await this.tagStore.bulkImport(tagsToInsert);
            const importedTagEvents = importedTags.map((tag) => ({
                type: TAG_IMPORT,
                createdBy: userName,
                data: tag,
            }));
            await this.eventStore.batchStore(importedTagEvents);
        }
    }

    async importTagTypes(
        tagTypes: ITagType[],
        keepExisting: boolean,
        oldTagTypes: ITagType[] = [],
        userName: string,
    ): Promise<void> {
        const tagTypesToInsert = tagTypes.filter((tagType) =>
            keepExisting
                ? !oldTagTypes.some((t) => t.name === tagType.name)
                : true,
        );
        if (tagTypesToInsert.length > 0) {
            const importedTagTypes = await this.tagTypeStore.bulkImport(
                tagTypesToInsert,
            );
            const importedTagTypeEvents = importedTagTypes.map((tagType) => ({
                type: TAG_TYPE_IMPORT,
                createdBy: userName,
                data: tagType,
            }));
            await this.eventStore.batchStore(importedTagTypeEvents);
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async export({
        includeFeatureToggles = true,
        includeStrategies = true,
        includeProjects = true,
        includeTags = true,
        includeEnvironments = true,
    }: IExportIncludeOptions): Promise<{
        features: FeatureToggle[];
        strategies: IStrategy[];
        version: number;
        projects: IProject[];
        tagTypes: ITagType[];
        tags: ITag[];
        featureTags: IFeatureTag[];
        featureStrategies: IFeatureStrategy[];
        environments: IEnvironment[];
        featureEnvironments: IFeatureEnvironment[];
    }> {
        return Promise.all([
            includeFeatureToggles
                ? this.toggleStore.getAll()
                : Promise.resolve([]),
            includeStrategies
                ? this.strategyStore.getEditableStrategies()
                : Promise.resolve([]),
            this.projectStore && includeProjects
                ? this.projectStore.getAll()
                : Promise.resolve([]),
            includeTags ? this.tagTypeStore.getAll() : Promise.resolve([]),
            includeTags ? this.tagStore.getAll() : Promise.resolve([]),
            includeTags && includeFeatureToggles
                ? this.featureTagStore.getAll()
                : Promise.resolve([]),
            includeFeatureToggles
                ? this.featureStrategiesStore.getAll()
                : Promise.resolve([]),
            includeEnvironments
                ? this.environmentStore.getAll()
                : Promise.resolve([]),
            includeFeatureToggles
                ? this.featureEnvironmentStore.getAll()
                : Promise.resolve([]),
        ]).then(
            ([
                features,
                strategies,
                projects,
                tagTypes,
                tags,
                featureTags,
                featureStrategies,
                environments,
                featureEnvironments,
            ]) => ({
                version: 2,
                features,
                strategies,
                projects,
                tagTypes,
                tags,
                featureTags,
                featureStrategies,
                environments,
                featureEnvironments,
            }),
        );
    }
}

module.exports = StateService;
