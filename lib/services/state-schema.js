const joi = require('joi');
const { featureShema } = require('../routes/admin-api/feature-schema');
const strategySchema = require('../routes/admin-api/strategy-schema');

// TODO: Extract to seperate file
const stateSchema = joi.object().keys({
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

module.exports = {
    stateSchema,
};
