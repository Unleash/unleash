import { tagSchema } from './tag-schema.js';
import type { FromSchema } from 'json-schema-to-ts';

export const tagWithVersionSchema = {
    $id: '#/components/schemas/tagWithVersionSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'tag'],
    description:
        'A tag with a version number representing the schema used to model the tag.',
    properties: {
        version: {
            type: 'integer',
            description: 'The version of the schema used to model the tag.',
            example: 1,
        },
        tag: {
            $ref: '#/components/schemas/tagSchema',
        },
    },
    components: {
        schemas: { tagSchema },
    },
} as const;

export type TagWithVersionSchema = FromSchema<typeof tagWithVersionSchema>;
