import { createSchemaObject, CreateSchemaType } from '../types';
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

export type TagsSchema = CreateSchemaType<typeof schema>;

export const tagsSchema = createSchemaObject(schema);
