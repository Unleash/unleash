import type { FromSchema } from 'json-schema-to-ts';
import { strategySchema } from './strategy-schema.js';

export const strategiesSchema = {
    $id: '#/components/schemas/strategiesSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'strategies'],
    description: 'List of strategies',
    properties: {
        version: {
            type: 'integer',
            enum: [1],
            example: 1,
            description: 'Version of the strategies schema',
        },
        strategies: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/strategySchema',
            },
            description: 'List of strategies',
        },
    },
    components: {
        schemas: {
            strategySchema,
        },
    },
} as const;

export type StrategiesSchema = FromSchema<typeof strategiesSchema>;
