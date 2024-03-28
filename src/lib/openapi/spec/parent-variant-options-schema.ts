import type { FromSchema } from 'json-schema-to-ts';

export const parentVariantOptionsSchema = {
    $id: '#/components/schemas/parentVariantOptionsSchema',
    type: 'array',
    description:
        'A list of parent variant names available for a given parent feature. This list includes strategy variants and feature environment variants.',
    items: {
        type: 'string',
    },
    components: {},
} as const;

export type ParentVariantOptionsSchema = FromSchema<
    typeof parentVariantOptionsSchema
>;
