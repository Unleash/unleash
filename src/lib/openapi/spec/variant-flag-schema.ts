import { FromSchema } from 'json-schema-to-ts';

export const variantFlagSchema = {
    $id: '#/components/schemas/variantFlagSchema',
    type: 'object',
    additionalProperties: false,
    properties: {
        name: {
            type: 'string',
        },
        enabled: {
            type: 'boolean',
        },
        payload: {
            type: 'object',
            additionalProperties: false,
            properties: {
                type: {
                    type: 'string',
                },
                value: {
                    type: 'string',
                },
            },
        },
    },
    components: {},
} as const;

export type VariantFlagSchema = FromSchema<typeof variantFlagSchema>;
