import { FromSchema } from 'json-schema-to-ts';

export const tagTypeSchema = {
    $id: '#/components/schemas/tagTypeSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name'],
    properties: {
        name: {
            type: 'string',
        },
        description: {
            type: 'string',
        },
        icon: {
            type: 'string',
            nullable: true,
        },
    },
    components: {},
} as const;

export type TagTypeSchema = FromSchema<typeof tagTypeSchema>;
