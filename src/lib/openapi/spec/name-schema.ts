import type { FromSchema } from 'json-schema-to-ts';

export const nameSchema = {
    $id: '#/components/schemas/nameSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name'],
    description: 'An object with a name',
    properties: {
        name: {
            description: 'The name of the represented object.',
            example: 'betaUser',
            type: 'string',
        },
    },
    components: {},
} as const;

export type NameSchema = FromSchema<typeof nameSchema>;
