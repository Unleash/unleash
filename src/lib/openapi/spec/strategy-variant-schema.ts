import { FromSchema } from 'json-schema-to-ts';
import { createStrategyVariantSchema } from './create-strategy-variant-schema';

export const strategyVariantSchema = {
    $id: '#/components/schemas/strategyVariantSchema',
    type: 'object',
    additionalProperties: false,
    description:
        '[WIP] A strategy variant allows to attach any data to strategies instead of only returning `true`/`false`. Strategy variants take precedence over feature variants.',
    required: ['name', 'weight', 'weightType', 'stickiness'],
    properties: {
        ...createStrategyVariantSchema.properties,
    },
    components: {},
} as const;

export type StrategyVariantSchema = FromSchema<typeof strategyVariantSchema>;
