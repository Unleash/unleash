const joi = require('joi');
const { featureSchema, featureTagSchema } = require('./feature-schema');
const strategySchema = require('./strategy-schema');
const { tagSchema } = require('./tag-schema');
const { tagTypeSchema } = require('./tag-type-schema');
const projectSchema = require('./project-schema');

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
    tags: joi
        .array()
        .optional()
        .items(tagSchema),
    tagTypes: joi
        .array()
        .optional()
        .items(tagTypeSchema),
    featureTags: joi
        .array()
        .optional()
        .items(featureTagSchema),
    projects: joi
        .array()
        .optional()
        .items(projectSchema),
});

module.exports = {
    stateSchema,
};
