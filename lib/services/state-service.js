const { stateSchema } = require('./state-schema');
const {
    FEATURE_IMPORT,
    DROP_FEATURES,
    STRATEGY_IMPORT,
    DROP_STRATEGIES,
} = require('../event-type');

const {
    readFile,
    parseFile,
    filterExisitng,
    filterEqual,
} = require('./state-util');

class StateService {
    constructor(stores, { getLogger }) {
        this.eventStore = stores.eventStore;
        this.toggleStore = stores.featureToggleStore;
        this.strategyStore = stores.strategyStore;
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
            this.logger.info(`Dropping existing feature toggles`);
            await this.eventStore.store({
                type: DROP_FEATURES,
                createdBy: userName,
                data: { name: 'all-features' },
            });
        }

        await Promise.all(
            features
                .filter(filterExisitng(keepExisting, oldToggles))
                .filter(filterEqual(oldToggles))
                .map(feature =>
                    this.eventStore.store({
                        type: FEATURE_IMPORT,
                        createdBy: userName,
                        data: feature,
                    }),
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
            this.logger.info(`Dropping existing strategies`);
            await this.eventStore.store({
                type: DROP_STRATEGIES,
                createdBy: userName,
                data: { name: 'all-strategies' },
            });
        }

        await Promise.all(
            strategies
                .filter(filterExisitng(keepExisting, oldStrategies))
                .filter(filterEqual(oldStrategies))
                .map(strategy =>
                    this.eventStore.store({
                        type: STRATEGY_IMPORT,
                        createdBy: userName,
                        data: strategy,
                    }),
                ),
        );
    }

    async export({ includeFeatureToggles = true, includeStrategies = true }) {
        return Promise.all([
            includeFeatureToggles
                ? this.toggleStore.getFeatures()
                : Promise.resolve(),
            includeStrategies
                ? this.strategyStore.getEditableStrategies()
                : Promise.resolve(),
        ]).then(([features, strategies]) => ({
            version: 1,
            features,
            strategies,
        }));
    }
}

module.exports = StateService;
