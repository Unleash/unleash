import joi from 'joi';
import { constraintSchema } from '../schema/feature-schema';

export const segmentSchema = joi
    .object()
    .keys({
        name: joi.string().required(),
        description: joi.string().allow(null).allow('').optional(),
        constraints: joi.array().items(constraintSchema).required(),
    })
    .options({ allowUnknown: true });

export const featureStrategySegmentSchema = joi
    .object()
    .keys({
        segmentId: joi.number().required(),
        featureStrategyId: joi.string().required(),
    })
    .options({ allowUnknown: true });
