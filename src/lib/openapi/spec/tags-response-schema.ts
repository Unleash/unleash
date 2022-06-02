import { createSchemaObject, CreateSchemaType } from '../schema';
import { tagSchema } from './tag-schema';

const schema = {
    type: 'object',
    additionalProperties: false,
    required: ['version', 'tags'],
    properties: {
        version: {
            type: 'integer',
        },
        tags: {
            type: 'array',
            items: tagSchema,
        },
    },
} as const;

export type TagsResponseSchema = CreateSchemaType<typeof schema>;

export const tagsResponseSchema = createSchemaObject(schema);
