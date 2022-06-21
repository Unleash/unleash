import { FromSchema } from 'json-schema-to-ts';
import { tagTypeSchema } from './tag-type-schema';

export const validateTagTypeSchema = {
    $id: '#/components/schemas/validateTagTypeSchema',
    type: 'object',
    required: ['valid', 'tagType'],
    properties: {
        valid: {
            type: 'boolean',
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
