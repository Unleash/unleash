import type { FromSchema } from 'json-schema-to-ts';
import { tagTypeSchema } from './tag-type-schema.js';

export const validateTagTypeSchema = {
    $id: '#/components/schemas/validateTagTypeSchema',
    type: 'object',
    required: ['valid', 'tagType'],
    description: 'The result of validating a tag type.',
    properties: {
        valid: {
            type: 'boolean',
            description: 'Whether or not the tag type is valid.',
            example: true,
        },
        tagType: {
            $ref: '#/components/schemas/tagTypeSchema',
        },
    },
    components: {
        schemas: {
            tagTypeSchema,
        },
    },
} as const;

export type ValidateTagTypeSchema = FromSchema<typeof validateTagTypeSchema>;
