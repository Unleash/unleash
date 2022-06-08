import { FromSchema } from 'json-schema-to-ts';
import { tagSchema } from './tag-schema';

export const tagsSchema = {
    $id: '#/components/schemas/tagsSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'tags'],
    properties: {
        version: {
            type: 'integer',
        },
        tags: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/tagSchema',
            },
        },
    },
    components: {
        schemas: {
            tagSchema,
        },
    },
} as const;

export type TagsSchema = FromSchema<typeof tagsSchema>;
