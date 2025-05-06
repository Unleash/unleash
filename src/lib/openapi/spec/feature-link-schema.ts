import type { FromSchema } from 'json-schema-to-ts';

export const featureLinkSchema = {
    $id: '#/components/schemas/featureLinkSchema',
    type: 'object',
    required: ['url'],
    properties: {
        url: {
            type: 'string',
            example: 'https://github.com/search?q=cleanupReminder&type=code',
            description: 'The URL the feature is linked to',
        },
        title: {
            type: 'string',
            example: 'Github cleanup',
            description: 'The description of the link',
            nullable: true,
        },
    },
    description: 'The link to any URL related to the feature',
    components: {
        schemas: {},
    },
} as const;

export type FeatureLinkSchema = FromSchema<typeof featureLinkSchema>;
