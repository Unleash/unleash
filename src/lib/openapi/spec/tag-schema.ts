import type { FromSchema } from 'json-schema-to-ts';
import { TAG_MAX_LENGTH, TAG_MIN_LENGTH } from '../../util';

export const tagSchema = {
    $id: '#/components/schemas/tagSchema',
    type: 'object',
    description:
        'Representation of a [tag](https://docs.getunleash.io/reference/feature-toggles#tags)',
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
                'The [type](https://docs.getunleash.io/reference/feature-toggles#tags) of the tag',
            example: 'simple',
        },
        color: {
            type: 'string',
            description:
                'The color for the tag. Can be either a hex color code (e.g. #FFFFFF) or a theme color reference (e.g. primary.main)',
            example: '#FFFFFF',
            pattern: '^(#[0-9A-Fa-f]{6}|[a-zA-Z0-9]+(\\.[a-zA-Z0-9]+)*)$',
            nullable: true,
        },
    },
    components: {},
} as const;

export type TagSchema = FromSchema<typeof tagSchema>;
