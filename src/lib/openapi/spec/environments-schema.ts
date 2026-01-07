import type { FromSchema } from 'json-schema-to-ts';
import { environmentSchema } from './environment-schema.js';

export const environmentsSchema = {
    $id: '#/components/schemas/environmentsSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'environments'],
    description: 'A versioned list of environments',
    properties: {
        version: {
            type: 'integer',
            example: 1,
            description: 'Version of the environments schema',
        },
        environments: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/environmentSchema',
            },
            description: 'List of environments',
        },
    },
    components: {
        schemas: {
            environmentSchema,
        },
    },
} as const;

export type EnvironmentsSchema = FromSchema<typeof environmentsSchema>;
