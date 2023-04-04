import { FromSchema } from 'json-schema-to-ts';
import { environmentProjectSchema } from './environment-project-schema';

export const environmentsProjectSchema = {
    $id: '#/components/schemas/environmentsProjectSchema',
    type: 'object',
    additionalProperties: false,
    required: ['version', 'environments'],
    description: 'Environments defined for a given project',
    properties: {
        version: {
            type: 'integer',
        },
        environments: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/environmentProjectSchema',
            },
        },
    },
    components: {
        schemas: {
            environmentProjectSchema,
        },
    },
} as const;

export type EnvironmentsProjectSchema = FromSchema<
    typeof environmentsProjectSchema
>;
