import type { FromSchema } from 'json-schema-to-ts';
import { TAG_MIN_LENGTH, TAG_MAX_LENGTH } from '../../tags/index.js';

export const tagSchema = {
    $id: '#/components/schemas/tagSchema',
    type: 'object',
    description:
        'Representation of a [tag](https://docs.getunleash.io/concepts/feature-flags#tags)',
    additionalProperties: false,
    required: ['value', 'type'],
    properties: {
        value: {
            type: 'string',
            description: `The value of the tag.`,
            minLength: TAG_MIN_LENGTH,
            maxLength: TAG_MAX_LENGTH,
            example: 'a-tag-value',
        },
        type: {
            type: 'string',
            minLength: TAG_MIN_LENGTH,
            maxLength: TAG_MAX_LENGTH,
            description:
                'The [type](https://docs.getunleash.io/concepts/feature-flags#tags) of the tag',
            example: 'simple',
        },
        color: {
            type: 'string',
            description: 'The hexadecimal color code for the tag type.',
            example: '#FFFFFF',
            pattern: '^#[0-9A-Fa-f]{6}$',
            nullable: true,
        },
    },
    components: {},
} as const;

export type TagSchema = FromSchema<typeof tagSchema>;
