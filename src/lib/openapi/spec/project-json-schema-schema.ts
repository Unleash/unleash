import type { FromSchema } from 'json-schema-to-ts';

export const projectJsonSchemaSchema = {
    $id: '#/components/schemas/projectJsonSchemaSchema',
    type: 'object',
    required: ['id', 'project', 'name', 'schema'],
    additionalProperties: false,
    properties: {
        id: {
            type: 'string',
            example: '01HXYZ1234567890ABCDEFGHJK',
            description: 'The unique identifier of this JSON schema.',
        },
        project: {
            type: 'string',
            example: 'my-project',
            description: 'The project this JSON schema belongs to.',
        },
        name: {
            type: 'string',
            example: 'feature-config-schema',
            description: 'A human-readable name for this JSON schema.',
        },
        schema: {
            type: 'object',
            additionalProperties: true,
            description: 'The JSON Schema definition.',
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'When this JSON schema was created.',
            example: '2023-12-01T12:00:00.000Z',
        },
    },
    description:
        'A JSON Schema definition scoped to a project, used to validate strategy variant payloads.',
    components: {
        schemas: {},
    },
} as const;

export type ProjectJsonSchemaSchema = FromSchema<
    typeof projectJsonSchemaSchema
>;
