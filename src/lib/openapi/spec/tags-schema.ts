import { createSchemaObject, CreateSchemaType } from '../types';

export const schema = {
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
} as const;

export type TagsSchema = CreateSchemaType<typeof schema>;

export const tagsSchema = createSchemaObject(schema);
