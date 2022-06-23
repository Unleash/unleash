import { FromSchema } from 'json-schema-to-ts';

export const parametersSchema = {
    $id: '#/components/schemas/parametersSchema',
    type: 'object',
    additionalProperties: {
        type: 'string',
    },
    components: {},
} as const;

export type ParametersSchema = FromSchema<typeof parametersSchema>;
