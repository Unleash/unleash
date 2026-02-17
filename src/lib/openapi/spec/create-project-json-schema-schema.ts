import type { FromSchema } from 'json-schema-to-ts';

export const createProjectJsonSchemaSchema = {
    $id: '#/components/schemas/createProjectJsonSchemaSchema',
    type: 'object',
    required: ['name', 'schema'],
    additionalProperties: false,
    properties: {
        name: {
            type: 'string',
            description: 'A human-readable name for this JSON schema.',
            example: 'feature-config-schema',
        },
        schema: {
            type: 'object',
            additionalProperties: true,
            description: 'A valid JSON Schema definition.',
        },
    },
    description: 'Data required to create or update a project JSON schema.',
    components: {
        schemas: {},
    },
} as const;

export type CreateProjectJsonSchemaSchema = FromSchema<
    typeof createProjectJsonSchemaSchema
>;
