import { tagSchema } from './tag-schema';
import { FromSchema } from 'json-schema-to-ts';

export const tagWithVersionSchema = {
    $id: '#/components/schemas/tagWithVersionSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'tag'],
    properties: {
        version: {
            type: 'integer',
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
