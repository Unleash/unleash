import type { FromSchema } from 'json-schema-to-ts';
import { createStrategyVariantSchema } from './create-strategy-variant-schema.js';

export const strategyVariantSchema = {
    $id: '#/components/schemas/strategyVariantSchema',
    type: 'object',
    additionalProperties: false,
    description:
        'Strategy variants allow you to attach any data to strategies instead of only returning `true`/`false`. Strategy variants take precedence over environment-level variants.',
    required: ['name', 'weight', 'weightType', 'stickiness'],
    properties: {
        ...createStrategyVariantSchema.properties,
    },
    components: {},
} as const;

export type StrategyVariantSchema = FromSchema<typeof strategyVariantSchema>;
