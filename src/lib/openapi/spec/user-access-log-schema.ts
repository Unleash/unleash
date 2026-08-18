import type { FromSchema } from 'json-schema-to-ts';
import { userAccessLogEntrySchema } from './user-access-log-entry-schema.js';

export const userAccessLogSchema = {
    $id: '#/components/schemas/userAccessLogSchema',
    type: 'object',
    additionalProperties: false,
    required: ['items', 'total'],
    description:
        'A paginated access log describing when users were added to and/or removed from the instance.',
    properties: {
        items: {
            description: 'The list of access log entries on this page.',
            type: 'array',
            items: {
                $ref: userAccessLogEntrySchema.$id,
            },
        },
        total: {
            type: 'integer',
            description:
                'The total number of access log entries matching the query.',
            minimum: 0,
            example: 42,
        },
    },
    components: {
        schemas: {
            userAccessLogEntrySchema,
        },
    },
} as const;

export type UserAccessLogSchema = FromSchema<typeof userAccessLogSchema>;
