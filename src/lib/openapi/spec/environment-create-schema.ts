import { FromSchema } from 'json-schema-to-ts';

export const environmentCreateSchema = {
    $id: '#/components/schemas/environmentCreateSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'type'],
    properties: {
        name: {
            type: 'string',
        },
        type: {
            type: 'string',
        },
        enabled: {
            type: 'boolean',
        },
        sortOrder: {
            type: 'number',
        },
    },
    components: {},
} as const;

export type EnvironmentCreateSchema = FromSchema<
    typeof environmentCreateSchema
>;
