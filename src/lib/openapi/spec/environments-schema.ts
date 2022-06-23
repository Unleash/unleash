import { FromSchema } from 'json-schema-to-ts';
import { environmentSchema } from './environment-schema';

export const environmentsSchema = {
    $id: '#/components/schemas/environmentsSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'environments'],
    properties: {
        version: {
            type: 'integer',
        },
        environments: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/environmentSchema',
            },
        },
    },
    components: {
        schemas: {
            environmentSchema,
        },
    },
} as const;

export type EnvironmentsSchema = FromSchema<typeof environmentsSchema>;
