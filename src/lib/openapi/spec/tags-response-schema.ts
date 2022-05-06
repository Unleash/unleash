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
        tagSchema: tagSchema,
    },
} as const;

export type TagsResponseSchema = CreateSchemaType<typeof schema>;
const { 'components/schemas': componentsSchemas, ...rest } = schema;
export const tagsResponseSchema = createSchemaObject(rest);
