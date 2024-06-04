import type { FromSchema } from 'json-schema-to-ts';
import { TAG_MAX_LENGTH, TAG_MIN_LENGTH } from '../../util';

export const tagSchema = {
    $id: '#/components/schemas/tagSchema',
    type: 'object',
    description:
        'Representation of a [tag](https://docs.getunleash.io/reference/tags)',
    additionalProperties: false,
    required: ['value', 'type'],
    properties: {
        value: {
            type: 'string',
            pattern: `^\\s*\\S.{${TAG_MIN_LENGTH - 2},${
                TAG_MAX_LENGTH - 2
            }}\\S\\s*$`,
            description: `The value of the tag. The value must be between ${TAG_MIN_LENGTH} and ${TAG_MAX_LENGTH} characters long. Leading and trailing whitespace is ignored and will be trimmed before saving the tag value.`,
            example: 'a-tag-value',
        },
        type: {
            type: 'string',
            minLength: TAG_MIN_LENGTH,
            maxLength: TAG_MAX_LENGTH,
            description:
                'The [type](https://docs.getunleash.io/reference/tags#tag-types) of the tag',
            example: 'simple',
        },
    },
    components: {},
} as const;

export type TagSchema = FromSchema<typeof tagSchema>;
