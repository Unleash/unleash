import type { FromSchema } from 'json-schema-to-ts';
import { projectJsonSchemaSchema } from './project-json-schema-schema.js';

export const projectJsonSchemasSchema = {
    $id: '#/components/schemas/projectJsonSchemasSchema',
    type: 'object',
    required: ['jsonSchemas'],
    additionalProperties: false,
    properties: {
        jsonSchemas: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/projectJsonSchemaSchema',
            },
            description: 'A list of JSON schemas for this project.',
        },
    },
    description: 'A list of JSON schemas for a project.',
    components: {
        schemas: {
            projectJsonSchemaSchema,
        },
    },
} as const;

export type ProjectJsonSchemasSchema = FromSchema<
    typeof projectJsonSchemasSchema
>;
