import joi from 'joi';
import { featureSchema, featureTagSchema } from '../schema/feature-schema';
import strategySchema from './strategy-schema';
import { tagSchema } from './tag-schema';
import { tagTypeSchema } from './tag-type-schema';
import projectSchema from './project-schema';
import { nameType } from '../routes/util';

export const featureStrategySchema = joi
    .object()
    .keys({
        id: joi.string().optional(),
        featureName: joi.string(),
        projectName: joi.string(),
        environment: joi.string(),
        parameters: joi.object().optional(),
        constraints: joi.array().optional(),
        strategyName: joi.string(),
    })
    .options({ stripUnknown: true });

export const featureEnvironmentsSchema = joi.object().keys({
    environment: joi.string(),
    featureName: joi.string(),
    enabled: joi.boolean(),
});

export const environmentSchema = joi.object().keys({
    name: nameType.allow(':global:'),
    displayName: joi.string().optional().allow(''),
});

export const stateSchema = joi.object().keys({
    version: joi.number(),
    features: joi.array().optional().items(featureSchema),
    strategies: joi.array().optional().items(strategySchema),
    tags: joi.array().optional().items(tagSchema),
    tagTypes: joi.array().optional().items(tagTypeSchema),
    featureTags: joi.array().optional().items(featureTagSchema),
    projects: joi.array().optional().items(projectSchema),
    featureStrategies: joi.array().optional().items(featureStrategySchema),
    featureEnvironments: joi
        .array()
        .optional()
        .items(featureEnvironmentsSchema),
    environments: joi.array().optional().items(environmentSchema),
});
