import { FromSchema } from 'json-schema-to-ts';

export const adminFeaturesQuerySchema = {
    $id: '#/components/schemas/adminFeaturesQuerySchema',
    type: 'object',
    additionalProperties: true,
    description: 'Used to filter feature toggles from the admin-api',
    properties: {
        tag: {
            type: 'array',
            items: {
                type: 'string',
            },
            description:
                'Used to filter by tags. For each entry, a TAGTYPE:TAGVALUE is expected',
        },
        namePrefix: {
            type: 'string',
            description:
                'A case-insensitive prefix filter for the names of feature toggles',
        },
    },
    components: {},
} as const;

export type AdminFeaturesQuerySchema = FromSchema<
    typeof adminFeaturesQuerySchema
>;
