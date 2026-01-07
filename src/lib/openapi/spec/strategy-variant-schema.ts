import type { FromSchema } from 'json-schema-to-ts';
import { createStrategyVariantSchema } from './create-strategy-variant-schema.js';

export const strategyVariantSchema = {
    $id: '#/components/schemas/strategyVariantSchema',
    type: 'object',
    additionalProperties: false,
    description:
        "This is an experimental property. It may change or be removed as we work on it. Please don't depend on it yet. A strategy variant allows you to attach any data to strategies instead of only returning `true`/`false`. Strategy variants take precedence over feature variants.",
    required: ['name', 'weight', 'weightType', 'stickiness'],
    properties: {
        ...createStrategyVariantSchema.properties,
    },
    components: {},
} as const;

export type StrategyVariantSchema = FromSchema<typeof strategyVariantSchema>;
