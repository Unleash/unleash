import { FromSchema } from 'json-schema-to-ts';
import { tagSchema } from './tag-schema';

export const tagsSchema = {
    $id: '#/components/schemas/tagsSchema',
    description: 'A list of tags with a version number',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'tags'],
    properties: {
        version: {
            type: 'integer',
            description: 'The version of the schema used to model the tags.',
        },
        tags: {
            type: 'array',
            description: 'A list of tags.',
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
