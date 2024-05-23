import type { FromSchema } from 'json-schema-to-ts';

export const adminFeaturesQuerySchema = {
    $id: '#/components/schemas/adminFeaturesQuerySchema',
    type: 'object',
    additionalProperties: false,
    description:
        'Query parameters used to modify the list of features returned.',
    properties: {
        tag: {
            type: 'array',
            items: {
                type: 'string',
                pattern: '\\w+:\\w+',
            },
            description:
                'Used to filter by tags. For each entry, a TAGTYPE:TAGVALUE is expected',
            example: ['simple:mytag'],
        },
        namePrefix: {
            type: 'string',
            description:
                'A case-insensitive prefix filter for the names of feature flags',
            example: 'demo.part1',
        },
    },
    components: {},
} as const;

export type AdminFeaturesQuerySchema = FromSchema<
    typeof adminFeaturesQuerySchema
>;
