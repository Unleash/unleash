import { FromSchema } from 'json-schema-to-ts';

export const projectEnvironmentSchema = {
    $id: '#/components/schemas/projectEnvironmentSchema',
    type: 'object',
    additionalProperties: false,
    required: ['environment'],
    properties: {
        environment: {
            type: 'string',
        },
        changeRequestsEnabled: {
            type: 'boolean',
        },
    },
    components: {},
} as const;

export type ProjectEnvironmentSchema = FromSchema<
    typeof projectEnvironmentSchema
>;
