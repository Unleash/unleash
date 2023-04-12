import { FromSchema } from 'json-schema-to-ts';

export const TAG_MIN_LENGTH = 2;
export const TAG_MAX_LENGTH = 50;
export const tagSchema = {
    $id: '#/components/schemas/tagSchema',
    type: 'object',
    additionalProperties: false,
    required: ['value', 'type'],
    properties: {
        value: {
            type: 'string',
            minLength: TAG_MIN_LENGTH,
            maxLength: TAG_MAX_LENGTH,
        },
        type: {
            type: 'string',
            minLength: TAG_MIN_LENGTH,
            maxLength: TAG_MAX_LENGTH,
            default: 'simple',
        },
    },
    example: {
        value: 'tag-value',
        type: 'simple',
    },
    components: {},
} as const;

export type TagSchema = FromSchema<typeof tagSchema>;
