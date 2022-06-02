import { FromSchema } from 'json-schema-to-ts';
import { DeepMutable } from '../../types/mutable';
import { constraintSchema } from './constraint-schema';
import { parametersSchema } from './parameters-schema';

export const schema = {
    type: 'object',
    additionalProperties: false,
    required: [
        'id',
        'featureName',
        'strategyName',
        'constraints',
        'parameters',
        'environment',
    ],
    properties: {
        id: {
            type: 'string',
        },
        name: {
            type: 'string',
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
        },
        featureName: {
            type: 'string',
        },
        projectId: {
            type: 'string',
        },
        environment: {
            type: 'string',
        },
        strategyName: {
            type: 'string',
        },
        sortOrder: {
            type: 'number',
        },
        constraints: {
            type: 'array',
            items: constraintSchema,
        },
        parameters: parametersSchema,
    },
} as const;

export type FeatureStrategySchema = FromSchema<typeof schema>;

export const featureStrategySchema = schema as DeepMutable<typeof schema>;
