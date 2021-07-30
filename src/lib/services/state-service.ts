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
import FeatureToggleStore from '../db/feature-toggle-store';
import TagTypeStore, { ITagType } from '../db/tag-type-store';
import FeatureTagStore, { IFeatureTag } from '../db/feature-tag-store';
import ProjectStore, { IProject } from '../db/project-store';
import TagStore from '../db/tag-store';
import StrategyStore, { IStrategy } from '../db/strategy-store';
import { Logger } from '../logger';
import { IUnleashStores } from '../types/stores';
import { IUnleashConfig } from '../types/option';
import EventStore from '../db/event-store';
import {
    FeatureToggle,
    IEnvironment,
    IFeatureEnvironment,
    ITag,
} from '../types/model';
import FeatureStrategiesStore, {
    IFeatureStrategy,
} from '../db/feature-strategy-store';
import EnvironmentStore from '../db/environment-store';
import { GLOBAL_ENV } from '../types/environment';

export interface IBackupOption {
    includeFeatureToggles: boolean;
    includeStrategies: boolean;
    includeProjects: boolean;
    includeTags: boolean;
}

interface IImportOption {
    keepExising: boolean;
    dropBeforeImport: boolean;
    userName: string;
}

export default class StateService {
    private logger: Logger;

    private toggleStore: FeatureToggleStore;

    private featureStrategiesStore: FeatureStrategiesStore;

    private strategyStore: StrategyStore;

    private eventStore: EventStore;

    private tagStore: TagStore;

    private tagTypeStore: TagTypeStore;

    private projectStore: ProjectStore;

    private featureTagStore: FeatureTagStore;

    private environmentStore: EnvironmentStore;

    constructor(
        stores: IUnleashStores,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.eventStore = stores.eventStore;
        this.toggleStore = stores.featureToggleStore;
        this.strategyStore = stores.strategyStore;
        this.tagStore = stores.tagStore;
        this.featureStrategiesStore = stores.featureStrategiesStore;
        this.tagTypeStore = stores.tagTypeStore;
        this.projectStore = stores.projectStore;
        this.featureTagStore = stores.featureTagStore;
        this.environmentStore = stores.environmentStore;
        this.logger = getLogger('services/state-service.js');
    }

    async importFile({
        file,
        dropBeforeImport,
        userName,
        keepExisting,
    }): Promise<void> {
        return readFile(file)
            .then(data => parseFile(file, data))
            .then(data =>
                this.import({ data, userName, dropBeforeImport, keepExisting }),
            );
    }

    async import({
        data,
        userName,
        dropBeforeImport,
        keepExisting,
    }): Promise<void> {
        const importData = await stateSchema.validateAsync(data);

        if (importData.features) {
            let projectData;
            if (!importData.version || importData.version === 1) {
                projectData = await this.convertLegacyFeatures(importData);
            } else {
                projectData = importData;
            }
            const {
                features,
                featureStrategies,
                featureEnvironments,
            } = projectData;

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
                userName,
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
                    data.featureTags
                        .filter(t =>
                            data.features.some(f => f.name === t.featureName),
                        )
                        .map(t => ({
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

    async importFeatureEnvironments({ featureEnvironments }): Promise<void> {
        await Promise.all(
            featureEnvironments.map(env =>
                this.featureStrategiesStore.connectEnvironmentAndFeature(
                    env.featureName,
                    env.environment,
                    env.enabled,
                ),
            ),
        );
    }

    async importFeatureStrategies({
        featureStrategies,
        userName,
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
            await this.featureStrategiesStore.deleteFeatureStrategies();
        }
        const strategiesToImport = keepExisting
            ? featureStrategies.filter(
                  s => !oldFeatureStrategies.some(o => o.id === s.id),
            )
            : featureStrategies;
        await Promise.all(
            strategiesToImport.map(featureStrategy =>
                this.featureStrategiesStore.createStrategyConfig(
                    featureStrategy,
                ),
            ),
        );
    }

    async convertLegacyFeatures({
        features,
    }): Promise<{ features; featureStrategies; featureEnvironments }> {
        const strategies = features.flatMap(f =>
            f.strategies.map(strategy => ({
                featureName: f.name,
                projectName: f.project,
                constraints: strategy.constraints || [],
                parameters: strategy.parameters || {},
                environment: GLOBAL_ENV,
                strategyName: strategy.name,
            })),
        );
        const newFeatures = features;
        const featureEnvironments = features.map(feature => ({
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

    async importFeatures({
        features,
        userName,
        dropBeforeImport,
        keepExisting,
    }): Promise<void> {
        this.logger.info(`Importing ${features.length} feature toggles`);
        const oldToggles = dropBeforeImport
            ? []
            : await this.toggleStore.getFeatures();

        if (dropBeforeImport) {
            this.logger.info('Dropping existing feature toggles');
            await this.toggleStore.dropFeatures();
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
                .map(feature =>
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

    async importStrategies({
        strategies,
        userName,
        dropBeforeImport,
        keepExisting,
    }): Promise<void> {
        this.logger.info(`Importing ${strategies.length} strategies`);
        const oldStrategies = dropBeforeImport
            ? []
            : await this.strategyStore.getStrategies();

        if (dropBeforeImport) {
            this.logger.info('Dropping existing strategies');
            await this.strategyStore.dropStrategies();
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
                .map(strategy =>
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
            await this.projectStore.dropProjects();
            await this.eventStore.store({
                type: DROP_PROJECTS,
                createdBy: userName,
                data: { name: 'all-projects' },
            });
        }
        const projectsToImport = projects.filter(project =>
            keepExisting
                ? !oldProjects.some(old => old.id === project.id)
                : true,
        );
        if (projectsToImport.length > 0) {
            const importedProjects = await this.projectStore.importProjects(
                projectsToImport,
            );
            const importedProjectEvents = importedProjects.map(project => ({
                type: PROJECT_IMPORT,
                createdBy: userName,
                data: project,
            }));
            await this.eventStore.batchStore(importedProjectEvents);
        }
    }

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
            : await this.featureTagStore.getAllFeatureTags();
        if (dropBeforeImport) {
            this.logger.info(
                'Dropping all existing featuretags, tags and tagtypes',
            );
            await this.featureTagStore.dropFeatureTags();
            await this.tagStore.dropTags();
            await this.tagTypeStore.dropTagTypes();
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
        const featureTagsToInsert = featureTags.filter(tag =>
            keepExisting
                ? !oldFeatureTags.some(old => this.compareFeatureTags(old, tag))
                : true,
        );
        if (featureTagsToInsert.length > 0) {
            const importedFeatureTags = await this.featureTagStore.importFeatureTags(
                featureTagsToInsert,
            );
            const importedFeatureTagEvents = importedFeatureTags.map(tag => ({
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
        const tagsToInsert = tags.filter(tag =>
            keepExisting
                ? !oldTags.some(old => this.compareTags(old, tag))
                : true,
        );
        if (tagsToInsert.length > 0) {
            const importedTags = await this.tagStore.bulkImport(tagsToInsert);
            const importedTagEvents = importedTags.map(tag => ({
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
        const tagTypesToInsert = tagTypes.filter(tagType =>
            keepExisting
                ? !oldTagTypes.some(t => t.name === tagType.name)
                : true,
        );
        if (tagTypesToInsert.length > 0) {
            const importedTagTypes = await this.tagTypeStore.bulkImport(
                tagTypesToInsert,
            );
            const importedTagTypeEvents = importedTagTypes.map(tagType => ({
                type: TAG_TYPE_IMPORT,
                createdBy: userName,
                data: tagType,
            }));
            await this.eventStore.batchStore(importedTagTypeEvents);
        }
    }

    async export({
        includeFeatureToggles = true,
        includeStrategies = true,
        includeProjects = true,
        includeTags = true,
        includeEnvironments = true,
    }): Promise<{
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
                ? this.toggleStore.getFeatures()
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
                ? this.featureTagStore.getAllFeatureTags()
                : Promise.resolve([]),
            includeFeatureToggles
                ? this.featureStrategiesStore.getAll()
                : Promise.resolve([]),
            includeEnvironments
                ? this.environmentStore.getAll()
                : Promise.resolve([]),
            includeFeatureToggles
                ? this.featureStrategiesStore.getAllFeatureEnvironments()
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
