'use strict';

const joi = require('joi');
const fs = require('fs');
const mime = require('mime');
const { featureShema } = require('./routes/admin-api/feature-schema');
const strategySchema = require('./routes/admin-api/strategy-schema');
const getLogger = require('./logger');
const yaml = require('js-yaml');
const {
    FEATURE_IMPORT,
    DROP_FEATURES,
    STRATEGY_IMPORT,
    DROP_STRATEGIES,
} = require('./event-type');

const logger = getLogger('state-service.js');

const dataSchema = joi.object().keys({
    features: joi
        .array()
        .optional()
        .items(featureShema),
    strategies: joi
        .array()
        .optional()
        .items(strategySchema),
});

class StateService {
    constructor(config) {
        this.config = config;
    }

    async importFile({ importFile, dropBeforeImport, userName }) {
        let data = await new Promise((resolve, reject) =>
            fs.readFile(importFile, (err, v) =>
                err ? reject(err) : resolve(v)
            )
        );
        if (mime.lookup(importFile) === 'text/yaml') {
            data = yaml.safeLoad(data);
        }

        await this.import({
            data,
            dropBeforeImport,
            userName,
        });
    }

    async import({ data, userName, dropBeforeImport }) {
        const { eventStore } = this.config.stores;

        if (typeof data === 'string') {
            data = JSON.parse(data);
        }

        data = await joi.validate(data, dataSchema);

        if (data.features) {
            logger.info(`Importing ${data.features.length} features`);
            if (dropBeforeImport) {
                logger.info(`Dropping existing features`);
                await eventStore.store({
                    type: DROP_FEATURES,
                    createdBy: userName,
                    data: { name: 'all-features' },
                });
            }
            for (const feature of data.features) {
                await eventStore.store({
                    type: FEATURE_IMPORT,
                    createdBy: userName,
                    data: feature,
                });
            }
        }

        if (data.strategies) {
            logger.info(`Importing ${data.strategies.length} strategies`);
            if (dropBeforeImport) {
                logger.info(`Dropping existing strategies`);
                await eventStore.store({
                    type: DROP_STRATEGIES,
                    createdBy: userName,
                    data: { name: 'all-strategies' },
                });
            }
            for (const strategy of data.strategies) {
                await eventStore.store({
                    type: STRATEGY_IMPORT,
                    createdBy: userName,
                    data: strategy,
                });
            }
        }
    }

    async export({ strategies, featureToggles }) {
        const { featureToggleStore, strategyStore } = this.config.stores;
        const result = {};

        if (featureToggles) {
            result.features = await featureToggleStore.getFeatures();
        }

        if (strategies) {
            result.strategies = (await strategyStore.getStrategies())
                .filter(strat => strat.editable)
                .map(strat => {
                    strat = Object.assign({}, strat);
                    delete strat.editable;
                    return strat;
                });
        }

        return result;
    }
}

module.exports = StateService;
