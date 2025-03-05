import type { FromSchema } from 'json-schema-to-ts';
import { workspaceSchema } from './workspace-schema';

export const workspacesSchema = {
    $id: '#/components/schemas/workspacesSchema',
    type: 'array',
    items: { $ref: '#/components/schemas/workspaceSchema' },
    components: {
        schemas: {
            workspaceSchema,
        },
    },
} as const;

export type WorkspacesSchema = FromSchema<typeof workspacesSchema>;
