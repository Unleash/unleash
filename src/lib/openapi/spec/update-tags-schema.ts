import { FromSchema } from 'json-schema-to-ts';
import { tagSchema } from './tag-schema';

export const updateTagsSchema = {
    $id: '#/components/schemas/updateTagsSchema',
    type: 'object',
    additionalProperties: false,
    required: ['addedTags', 'removedTags'],
    properties: {
        addedTags: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/tagSchema',
            },
        },
        removedTags: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/tagSchema',
            },
        },
    },
    example: {
        addedTags: [
            {
                value: 'tag-to-add',
                type: 'simple',
            },
        ],
        removedTags: [
            {
                value: 'tag-to-remove',
                type: 'simple',
            },
        ],
    },
    components: {
        schemas: {
            tagSchema,
        },
    },
} as const;

export type UpdateTagsSchema = FromSchema<typeof updateTagsSchema>;
