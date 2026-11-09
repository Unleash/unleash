import type { FromSchema } from 'json-schema-to-ts';
import { TAG_MIN_LENGTH, TAG_MAX_LENGTH } from '../../tags/index.js';

export const renameTagSchema = {
    $id: '#/components/schemas/renameTagSchema',
    type: 'object',
    description:
        'The new value for an existing [tag](https://docs.getunleash.io/concepts/feature-flags#tags)',
    additionalProperties: false,
    required: ['value'],
    properties: {
        value: {
            type: 'string',
            pattern: `^\\s*\\S.{${TAG_MIN_LENGTH - 2},${
                TAG_MAX_LENGTH - 2
            }}\\S\\s*$`,
            description: `The new value of the tag. The value must be between ${TAG_MIN_LENGTH} and ${TAG_MAX_LENGTH} characters long. If the value already exists for the same tag type, the two tags are merged. Leading and trailing whitespace is ignored and will be trimmed before saving the tag value.`,
            example: 'a-new-tag-value',
        },
    },
    components: {},
} as const;

export type RenameTagSchema = FromSchema<typeof renameTagSchema>;
