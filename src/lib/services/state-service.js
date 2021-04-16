const { stateSchema } = require('./state-schema');
const {
    FEATURE_IMPORT,
    DROP_FEATURES,
    STRATEGY_IMPORT,
    DROP_STRATEGIES,
    TAG_IMPORT,
    DROP_TAGS,
    FEATURE_TAG_IMPORT,
    DROP_FEATURE_TAGS,
    TAG_TYPE_IMPORT,
    DROP_TAG_TYPES,
    PROJECT_IMPORT,
    DROP_PROJECTS,
} = require('../event-type');

const {
    readFile,
    parseFile,
    filterExisting,
    filterEqual,
} = require('./state-util');

class StateService {
    constructor(stores, { getLogger }) {
        this.eventStore = stores.eventStore;
        this.toggleStore = stores.featureToggleStore;
        this.strategyStore = stores.strategyStore;
        this.tagStore = stores.tagStore;
        this.tagTypeStore = stores.tagTypeStore;
        this.projectStore = stores.projectStore;
        this.logger = getLogger('services/state-service.js');
    }

    importFile({ file, dropBeforeImport, userName, keepExisting }) {
        return readFile(file)
            .then(data => parseFile(file, data))
            .then(data =>
                this.import({ data, userName, dropBeforeImport, keepExisting }),
            );
    }

    async import({ data, userName, dropBeforeImport, keepExisting }) {
        const importData = await stateSchema.validateAsync(data);

        if (importData.features) {
            await this.importFeatures({
                features: data.features,
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

        if (importData.tagTypes && importData.tags) {
            await this.importTagData({
                tagTypes: data.tagTypes,
                tags: data.tags,
                featureTags: data.featureTags || [],
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
    }

    async importFeatures({
        features,
        userName,
        dropBeforeImport,
        keepExisting,
    }) {
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
                    this.toggleStore.importFeature(feature).then(() =>
                        this.eventStore.store({
                            type: FEATURE_IMPORT,
                            createdBy: userName,
                            data: feature,
                        }),
                    ),
                ),
        );
    }

    async importStrategies({
        strategies,
        userName,
        dropBeforeImport,
        keepExisting,
    }) {
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
    }) {
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
    }) {
        this.logger.info(
            `Importing ${tagTypes.length} tagtypes, ${tags.length} tags and ${featureTags.length} feature tags`,
        );
        const oldTagTypes = dropBeforeImport
            ? []
            : await this.tagTypeStore.getAll();
        const oldTags = dropBeforeImport ? [] : await this.tagStore.getAll();
        const oldFeatureTags = dropBeforeImport
            ? []
            : await this.toggleStore.getAllFeatureTags();
        if (dropBeforeImport) {
            this.logger.info(
                'Dropping all existing featuretags, tags and tagtypes',
            );
            await this.toggleStore.dropFeatureTags();
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

    compareFeatureTags = (old, tag) =>
        old.featureName === tag.featureName &&
        old.tagValue === tag.tagValue &&
        old.tagType === tag.tagType;

    async importFeatureTags(
        featureTags,
        keepExisting,
        oldFeatureTags,
        userName,
    ) {
        const featureTagsToInsert = featureTags.filter(tag =>
            keepExisting
                ? !oldFeatureTags.some(old => this.compareFeatureTags(old, tag))
                : true,
        );
        if (featureTagsToInsert.length > 0) {
            const importedFeatureTags = await this.toggleStore.importFeatureTags(
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

    compareTags = (old, tag) =>
        old.type === tag.type && old.value === tag.value;

    async importTags(tags, keepExisting, oldTags, userName) {
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

    async importTagTypes(tagTypes, keepExisting, oldTagTypes = [], userName) {
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
    }) {
        return Promise.all([
            includeFeatureToggles
                ? this.toggleStore.getFeatures()
                : Promise.resolve(),
            includeStrategies
                ? this.strategyStore.getEditableStrategies()
                : Promise.resolve(),
            this.projectStore && includeProjects
                ? this.projectStore.getAll()
                : Promise.resolve(),
            includeTags ? this.tagTypeStore.getAll() : Promise.resolve(),
            includeTags ? this.tagStore.getAll() : Promise.resolve(),
            includeTags
                ? this.toggleStore.getAllFeatureTags()
                : Promise.resolve(),
        ]).then(
            ([
                features,
                strategies,
                projects,
                tagTypes,
                tags,
                featureTags,
            ]) => ({
                version: 1,
                features,
                strategies,
                projects,
                tagTypes,
                tags,
                featureTags,
            }),
        );
    }
}

module.exports = StateService;
