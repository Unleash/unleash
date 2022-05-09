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
            items: {
                $ref: '#/components/schemas/tagSchema',
            },
        },
    },
    'components/schemas': {
        tagSchema,
    },
} as const;

export type TagsResponseSchema = CreateSchemaType<typeof schema>;

export const tagsResponseSchema = createSchemaObject(schema);
