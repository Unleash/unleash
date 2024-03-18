import type { FromSchema } from 'json-schema-to-ts';

export const tagTypeSchema = {
    $id: '#/components/schemas/tagTypeSchema',
    type: 'object',
    additionalProperties: false,
    description: 'A tag type.',
    required: ['name'],
    properties: {
        name: {
            type: 'string',
            description: 'The name of the tag type.',
            example: 'color',
        },
        description: {
            type: 'string',
            description: 'The description of the tag type.',
            example: 'A tag type for describing the color of a tag.',
        },
        icon: {
            type: 'string',
            nullable: true,
            description: 'The icon of the tag type.',
            example: 'not-really-used',
        },
    },
    components: {},
} as const;

export type TagTypeSchema = FromSchema<typeof tagTypeSchema>;
