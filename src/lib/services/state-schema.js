const joi = require('joi');
const { featureSchema } = require('./feature-schema');
const strategySchema = require('./strategy-schema');

// TODO: Extract to seperate file
const stateSchema = joi.object().keys({
    version: joi.number(),
    features: joi
        .array()
        .optional()
        .items(featureSchema),
    strategies: joi
        .array()
        .optional()
        .items(strategySchema),
});

module.exports = {
    stateSchema,
};
