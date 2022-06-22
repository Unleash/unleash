import { FromSchema } from 'json-schema-to-ts';

export const roleDescriptionSchema = {
    $id: '#/components/schemas/roleDescriptionSchema',
    type: 'object',
    additionalProperties: false,
    required: ['description', 'name', 'type'],
    properties: {
        description: {
            type: 'string',
        },
        name: {
            type: 'string',
        },
        type: {
            type: 'string',
        },
    },
    components: {},
} as const;

export type RoleDescriptionSchema = FromSchema<typeof roleDescriptionSchema>;
