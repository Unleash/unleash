import { FromSchema } from 'json-schema-to-ts';
import { TAG_MAX_LENGTH, TAG_MIN_LENGTH } from '../../services/tag-schema';

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
