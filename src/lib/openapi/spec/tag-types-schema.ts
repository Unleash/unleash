import { tagTypeWithUsageSchema } from './tag-type-with-usage-schema.js';
import type { FromSchema } from 'json-schema-to-ts';

export const tagTypesSchema = {
    $id: '#/components/schemas/tagTypesSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'tagTypes'],
    description:
        'A list of tag types with a version number representing the schema used to model the tag types.',
    properties: {
        version: {
            type: 'integer',
            description:
                'The version of the schema used to model the tag types.',
            example: 1,
        },
        tagTypes: {
            type: 'array',
            description: 'The list of tag types.',
            items: {
                $ref: '#/components/schemas/tagTypeWithUsageSchema',
            },
        },
    },
    components: {
        schemas: {
            tagTypeWithUsageSchema,
        },
    },
} as const;

export type TagTypesSchema = FromSchema<typeof tagTypesSchema>;
