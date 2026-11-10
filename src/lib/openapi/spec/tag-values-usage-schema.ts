import type { FromSchema } from 'json-schema-to-ts';

export const tagValuesUsageSchema = {
    $id: '#/components/schemas/tagValuesUsageSchema',
    type: 'object',
    additionalProperties: false,
    required: ['limit', 'offset', 'total', 'tagValues'],
    description:
        'A page of the values of a tag type, with how many flags use each value.',
    properties: {
        limit: {
            type: 'integer',
            minimum: 1,
            example: 50,
            description: 'The maximum number of values in this page.',
        },
        offset: {
            type: 'integer',
            minimum: 0,
            example: 0,
            description: 'The number of values skipped before this page.',
        },
        total: {
            type: 'integer',
            minimum: 0,
            example: 12,
            description: 'The number of values of this tag type.',
        },
        tagValues: {
            type: 'array',
            description: 'The tag values in this page, sorted by value.',
            items: {
                type: 'object',
                additionalProperties: false,
                required: [
                    'value',
                    'usedInActiveFeatures',
                    'usedInArchivedFeatures',
                ],
                properties: {
                    value: {
                        type: 'string',
                        example: 'payments',
                        description: 'The tag value.',
                    },
                    usedInActiveFeatures: {
                        type: 'integer',
                        minimum: 0,
                        example: 3,
                        description:
                            'The number of active flags with this tag, in projects the user can access.',
                    },
                    usedInArchivedFeatures: {
                        type: 'integer',
                        minimum: 0,
                        example: 1,
                        description:
                            'The number of archived flags with this tag, in projects the user can access.',
                    },
                },
            },
        },
    },
    components: {},
} as const;

export type TagValuesUsageSchema = FromSchema<typeof tagValuesUsageSchema>;
