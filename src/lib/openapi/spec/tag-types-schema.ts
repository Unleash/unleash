import { tagTypeSchema } from './tag-type-schema';
import { FromSchema } from 'json-schema-to-ts';

export const tagTypesSchema = {
    $id: '#/components/schemas/tagTypesSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'tagTypes'],
    properties: {
        version: {
            type: 'integer',
        },
        tagTypes: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/tagTypeSchema',
            },
        },
    },
    components: {
        schemas: {
            tagTypeSchema,
        },
    },
} as const;

export type TagTypesSchema = FromSchema<typeof tagTypesSchema>;
