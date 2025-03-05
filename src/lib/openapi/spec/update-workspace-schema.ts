import type { FromSchema } from 'json-schema-to-ts';

export const updateWorkspaceSchema = {
    $id: '#/components/schemas/updateWorkspaceSchema',
    type: 'object',
    properties: {
        name: { type: 'string' },
        description: { type: 'string' },
    },
    additionalProperties: false,
    components: {},
} as const;

export type UpdateWorkspaceSchema = FromSchema<typeof updateWorkspaceSchema>;
