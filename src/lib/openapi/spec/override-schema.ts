import { FromSchema } from 'json-schema-to-ts';

export const overrideSchema = {
    $id: '#/components/schemas/overrideSchema',
    type: 'object',
    additionalProperties: false,
    required: ['contextName', 'values'],
    description:
        'An override for deciding which variant should be assigned to a user based on the context name',
    properties: {
        contextName: {
            description:
                'The name of the context field used to determine overrides',
            type: 'string',
            example: 'userId',
        },
        values: {
            description: 'Which values that should be overriden',
            type: 'array',
            items: {
                type: 'string',
            },
            example: ['red', 'blue'],
        },
    },
    components: {},
} as const;

export type OverrideSchema = FromSchema<typeof overrideSchema>;
