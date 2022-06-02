import { FromSchema } from 'json-schema-to-ts';
import { DeepMutable } from '../../types/mutable';
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

export type TagsSchema = FromSchema<typeof schema>;

export const tagsSchema = schema as DeepMutable<typeof schema>;
