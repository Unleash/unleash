import { createSchemaObject, CreateSchemaType } from '../types';
import { constraintSchema } from './constraint-schema';
import { parametersSchema } from './parameters-schema';

export const schema = {
    type: 'object',
    additionalProperties: false,
    required: [
        'id',
        'name',
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
            items: {
                $ref: '#/components/schemas/constraintSchema',
            },
        },
        parameters: {
            $ref: '#/components/schemas/parametersSchema',
        },
    },
    'components/schemas': {
        constraintSchema,
        parametersSchema,
    },
} as const;

export type FeatureStrategySchema = CreateSchemaType<typeof schema>;

export const featureStrategySchema = createSchemaObject(schema);
