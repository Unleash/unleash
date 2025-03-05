import type { FromSchema } from 'json-schema-to-ts';

export const createWorkspaceSchema = {
    $id: '#/components/schemas/createWorkspaceSchema',
    type: 'object',
    required: ['name'],
    properties: {
        name: { type: 'string' },
        description: { type: 'string' },
    },
    additionalProperties: false,
    components: {},
} as const;

export type CreateWorkspaceSchema = FromSchema<typeof createWorkspaceSchema>;
