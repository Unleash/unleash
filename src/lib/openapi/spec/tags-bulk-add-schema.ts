import { FromSchema } from 'json-schema-to-ts';
import { updateTagsSchema } from './update-tags-schema';
import { tagSchema } from './tag-schema';

export const tagsBulkAddSchema = {
    $id: '#/components/schemas/tagsBulkAddSchema',
    description: 'Represents tag changes to be applied to a list of features.',
    type: 'object',
    additionalProperties: false,
    required: ['features', 'tags'],
    properties: {
        features: {
            description:
                'The list of features that will be affected by the tag changes.',
            type: 'array',
            items: {
                type: 'string',
                minLength: 1,
            },
        },
        tags: {
            description: 'The tag changes to be applied to the features.',
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
