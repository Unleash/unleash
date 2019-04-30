'use strict';

const joi = require('joi');
const fs = require('fs');
const mime = require('mime');
const { featureShema } = require('./routes/admin-api/feature-schema');
const strategySchema = require('./routes/admin-api/strategy-schema');
const YAML = require('js-yaml');
const {
    FEATURE_IMPORT,
    DROP_FEATURES,
    STRATEGY_IMPORT,
    DROP_STRATEGIES,
} = require('./event-type');

const dataSchema = joi.object().keys({
    version: joi.number(),
    features: joi
        .array()
        .optional()
        .items(featureShema),
    strategies: joi
        .array()
        .optional()
        .items(strategySchema),
});

function readFile(file) {
    return new Promise((resolve, reject) =>
        fs.readFile(file, (err, v) => (err ? reject(err) : resolve(v)))
    );
}

function parseFile(file, data) {
    return mime.getType(file) === 'text/yaml'
        ? YAML.safeLoad(data)
        : JSON.parse(data);
}

class StateService {
    constructor(config) {
        this.config = config;
        this.logger = config.getLogger('state-service.js');
    }

    importFile({ file, dropBeforeImport, userName }) {
        return readFile(file)
            .then(data => parseFile(file, data))
            .then(data => this.import({ data, userName, dropBeforeImport }));
    }

    async import({ data, userName, dropBeforeImport }) {
        const { eventStore } = this.config.stores;

        const importData = await joi.validate(data, dataSchema);

        if (importData.features) {
            this.logger.info(
                `Importing ${importData.features.length} features`
            );
            if (dropBeforeImport) {
                this.logger.info(`Dropping existing features`);
                await eventStore.store({
                    type: DROP_FEATURES,
                    createdBy: userName,
                    data: { name: 'all-features' },
                });
            }
            await Promise.all(
                importData.features.map(feature =>
                    eventStore.store({
                        type: FEATURE_IMPORT,
                        createdBy: userName,
                        data: feature,
                    })
                )
            );
        }

        if (importData.strategies) {
            this.logger.info(
                `Importing ${importData.strategies.length} strategies`
            );
            if (dropBeforeImport) {
                this.logger.info(`Dropping existing strategies`);
                await eventStore.store({
                    type: DROP_STRATEGIES,
                    createdBy: userName,
                    data: { name: 'all-strategies' },
                });
            }
            await Promise.all(
                importData.strategies.map(strategy =>
                    eventStore.store({
                        type: STRATEGY_IMPORT,
                        createdBy: userName,
                        data: strategy,
                    })
                )
            );
        }
    }

    async export({ includeFeatureToggles = true, includeStrategies = true }) {
        const { featureToggleStore, strategyStore } = this.config.stores;

        return Promise.all([
            includeFeatureToggles
                ? featureToggleStore.getFeatures()
                : Promise.resolve(),
            includeStrategies
                ? strategyStore.getEditableStrategies()
                : Promise.resolve(),
        ]).then(([features, strategies]) => ({
            version: 1,
            features,
            strategies,
        }));
    }
}

module.exports = StateService;
