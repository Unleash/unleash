import { FromSchema } from 'json-schema-to-ts';

export const patSchema = {
    $id: '#/components/schemas/patSchema',
    type: 'object',
    properties: {
        id: {
            type: 'number',
        },
        secret: {
            type: 'string',
        },
        expiresAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
        },
        seenAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
        },
    },
    components: {
        schemas: {},
    },
} as const;

export type PatSchema = FromSchema<typeof patSchema>;
