import { FromSchema } from 'json-schema-to-ts';
import { updateTagsSchema } from './update-tags-schema';
import { tagSchema } from './tag-schema';

export const tagsBulkAddSchema = {
    $id: '#/components/schemas/tagsBulkAddSchema',
    type: 'object',
    additionalProperties: false,
    required: ['features', 'tags'],
    properties: {
        features: {
            type: 'array',
            items: {
                type: 'string',
                minLength: 1,
            },
        },
        tags: {
            $ref: '#/components/schemas/updateTagsSchema',
        },
    },
    components: {
        schemas: {
            updateTagsSchema,
            tagSchema,
        },
    },
} as const;

export type TagsBulkAddSchema = FromSchema<typeof tagsBulkAddSchema>;
