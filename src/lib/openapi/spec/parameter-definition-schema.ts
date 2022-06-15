import { FromSchema } from 'json-schema-to-ts';

export const parameterDefinitionSchema = {
    $id: '#/components/schemas/addonDefinitionSchema',
    type: 'object',
    required: ['provider', 'description', 'enabled', 'parameters', 'events'],
    properties: {
        name: {
            type: 'string',
        },
        displayName: {
            type: 'string',
        },
        type: {
            type: 'string',
        },
        description: {
            type: 'string',
        },
        placeholder: {
            type: 'string',
        },
        required: {
            type: 'boolean',
        },
        sensitive: {
            type: 'boolean',
        },
    },
    components: {},
} as const;
export type ParameterDefinitionSchema = FromSchema<
    typeof parameterDefinitionSchema
>;
