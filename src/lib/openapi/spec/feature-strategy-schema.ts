import { FromSchema } from 'json-schema-to-ts';
import { constraintSchema } from './constraint-schema';
import { parametersSchema } from './parameters-schema';

export const featureStrategySchema = {
    $id: '#/components/schemas/featureStrategySchema',
    type: 'object',
    additionalProperties: false,
    required: ['name'],
    properties: {
        id: {
            type: 'string',
        },
        name: {
            type: 'string',
        },
        sortOrder: {
            type: 'number',
        },
        segments: {
            type: 'array',
            items: {
                type: 'number',
            },
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
    components: {
        schemas: {
            constraintSchema,
            parametersSchema,
        },
    },
} as const;

export type FeatureStrategySchema = FromSchema<typeof featureStrategySchema>;
