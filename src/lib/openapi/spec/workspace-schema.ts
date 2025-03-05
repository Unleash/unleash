import type { FromSchema } from 'json-schema-to-ts';
import { dateSchema } from './date-schema';

export const workspaceSchema = {
    $id: '#/components/schemas/workspaceSchema',
    type: 'object',
    additionalProperties: false,
    required: ['id', 'name', 'createdAt'],
    properties: {
        id: { type: 'number' },
        name: { type: 'string' },
        description: { type: 'string' },
        createdAt: { $ref: '#/components/schemas/dateSchema' },
        createdBy: { type: 'number' },
    },
    components: {
        schemas: {
            dateSchema,
        },
    },
} as const;

export type WorkspaceSchema = FromSchema<typeof workspaceSchema>;
