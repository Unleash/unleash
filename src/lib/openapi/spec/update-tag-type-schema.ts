import type { FromSchema } from 'json-schema-to-ts';

export const updateTagTypeSchema = {
    $id: '#/components/schemas/updateTagTypeSchema',
    type: 'object',
    description: 'The request body for updating a tag type.',
    properties: {
        description: {
            type: 'string',
            description: 'The description of the tag type.',
            example: 'A tag type for describing the color of a tag.',
        },
        icon: {
            type: 'string',
            description: 'The icon of the tag type.',
            example: 'not-really-used',
        },
    },
    components: {},
} as const;

export type UpdateTagTypeSchema = FromSchema<typeof updateTagTypeSchema>;
