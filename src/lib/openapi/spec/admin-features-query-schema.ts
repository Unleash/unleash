import { FromSchema } from 'json-schema-to-ts';

export const adminFeaturesQuerySchema = {
    $id: '#/components/schemas/adminFeaturesQuerySchema',
    type: 'object',
    additionalProperties: true,
    properties: {
        tag: {
            type: 'array',
            items: {
                type: 'array',
                items: {
                    type: 'string',
                },
            },
        },
        namePrefix: {
            type: 'string',
        },
    },
    components: {},
} as const;

export type AdminFeaturesQuerySchema = FromSchema<
    typeof adminFeaturesQuerySchema
>;
