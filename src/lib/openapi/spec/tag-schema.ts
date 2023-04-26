import { FromSchema } from 'json-schema-to-ts';

export const TAG_MIN_LENGTH = 2;
export const TAG_MAX_LENGTH = 50;
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
            minLength: TAG_MIN_LENGTH,
            maxLength: TAG_MAX_LENGTH,
            description: 'The value of the tag',
            example: 'a-tag-value',
        },
        type: {
            type: 'string',
            minLength: TAG_MIN_LENGTH,
            maxLength: TAG_MAX_LENGTH,
            default: 'simple',
            description:
                'The [type](https://docs.getunleash.io/reference/tags#tag-types) of the tag',
            example: 'simple',
        },
    },
    components: {},
} as const;

export type TagSchema = FromSchema<typeof tagSchema>;
