import joi from 'joi';
import { featureSchema, featureTagSchema } from '../schema/feature-schema';
import strategySchema from './strategy-schema';
import { tagSchema } from './tag-schema';
import { tagTypeSchema } from './tag-type-schema';
import { projectSchema } from './project-schema';
import { nameType } from '../routes/util';
import {
    featureStrategySegmentSchema,
    unsavedSegmentSchema,
} from './segment-schema';

export const featureStrategySchema = joi
    .object()
    .keys({
        id: joi.string().optional(),
        featureName: joi.string(),
        projectId: joi.string(),
        environment: joi.string(),
        parameters: joi.object().optional().allow(null),
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
    name: nameType,
    displayName: joi.string().optional().allow(''),
    type: joi.string().required(),
    sortOrder: joi.number().optional(),
    enabled: joi.boolean().optional(),
    protected: joi.boolean().optional(),
});

export const updateEnvironmentSchema = joi.object().keys({
    displayName: joi.string().optional().allow(''),
    type: joi.string().optional(),
    sortOrder: joi.number().optional(),
});

export const sortOrderSchema = joi.object().pattern(/^/, joi.number());

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
    segments: joi.array().optional().items(unsavedSegmentSchema),
    featureStrategySegments: joi
        .array()
        .optional()
        .items(featureStrategySegmentSchema),
});
