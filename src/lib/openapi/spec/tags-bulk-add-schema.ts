import { FromSchema } from 'json-schema-to-ts';
import { tagSchema } from './tag-schema';

export const tagsBulkAddSchema = {
    $id: '#/components/schemas/tagsBulkAddSchema',
    type: 'object',
    additionalProperties: false,
    required: ['features', 'tag'],
    properties: {
        features: {
            type: 'array',
            items: {
                type: 'string',
                minLength: 1,
            },
        },
        tag: {
            $ref: '#/components/schemas/tagSchema',
        },
    },
    components: {
        schemas: {
            tagSchema,
        },
    },
} as const;

export type TagsBulkAddSchema = FromSchema<typeof tagsBulkAddSchema>;
