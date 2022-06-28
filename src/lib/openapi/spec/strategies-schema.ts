import { FromSchema } from 'json-schema-to-ts';
import { strategySchema } from './strategy-schema';

export const strategiesSchema = {
    $id: '#/components/schemas/strategiesSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'strategies'],
    properties: {
        version: {
            type: 'integer',
        },
        strategies: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/strategySchema',
            },
        },
    },
    components: {
        schemas: {
            strategySchema,
        },
    },
} as const;

export type StrategiesSchema = FromSchema<typeof strategiesSchema>;
