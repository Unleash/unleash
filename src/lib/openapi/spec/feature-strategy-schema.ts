import { createSchemaObject, CreateSchemaType } from '../schema';
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
            format: 'date',
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

export type FeatureStrategySchema = CreateSchemaType<typeof schema>;

export const featureStrategySchema = createSchemaObject(schema);
