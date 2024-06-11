import type { FromSchema } from 'json-schema-to-ts';
import { TAG_MAX_LENGTH, TAG_MIN_LENGTH } from '../../util';
import { tagSchema } from './tag-schema';

export const createTagSchema = {
    ...tagSchema,
    $id: '#/components/schemas/createTagSchema',
    description:
        'Data used to create a new [tag](https://docs.getunleash.io/reference/tags)',
    properties: {
        ...tagSchema.properties,
        value: {
            type: 'string',
            pattern: `^\\s*\\S.{${TAG_MIN_LENGTH - 2},${
                TAG_MAX_LENGTH - 2
            }}\\S\\s*$`,
            description: `The value of the tag. The value must be between ${TAG_MIN_LENGTH} and ${TAG_MAX_LENGTH} characters long. Leading and trailing whitespace is ignored and will be trimmed before saving the tag value.`,
            example: 'a-tag-value',
        },
    },
    components: {},
} as const;

export type CreateTagSchema = FromSchema<typeof createTagSchema>;
