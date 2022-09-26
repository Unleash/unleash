import { FromSchema } from 'json-schema-to-ts';
import { ApiTokenType } from '../../types/models/api-token';

export const apiTokenSchema = {
    $id: '#/components/schemas/apiTokenSchema',
    type: 'object',
    additionalProperties: false,
    required: ['username', 'type'],
    properties: {
        secret: {
            type: 'string',
        },
        username: {
            type: 'string',
        },
        type: {
            type: 'string',
            enum: Object.values(ApiTokenType),
        },
        environment: {
            type: 'string',
        },
        project: {
            type: 'string',
        },
        projects: {
            type: 'array',
            items: {
                type: 'string',
            },
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
        alias: {
            type: 'string',
            nullable: true,
        },
    },
    components: {},
} as const;

export type ApiTokenSchema = FromSchema<typeof apiTokenSchema>;
