import type { FromSchema } from 'json-schema-to-ts';

export const parametersSchema = {
    $id: '#/components/schemas/parametersSchema',
    type: 'object',
    description: 'A list of parameters for a strategy',
    additionalProperties: {
        type: 'string',
    },
    components: {},
} as const;

export type ParametersSchema = FromSchema<typeof parametersSchema>;
