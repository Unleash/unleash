import { FromSchema } from 'json-schema-to-ts';
import { ApiTokenType } from '../../types/models/api-token';

export const apiTokenSchema = {
    $id: '#/components/schemas/apiTokenSchema',
    type: 'object',
    additionalProperties: false,
    required: ['type'],
    properties: {
        secret: {
            type: 'string',
        },
        username: {
            type: 'string',
            deprecated: true,
            description:
                'This property was deprecated in Unleash v5. Prefer the `tokenName` property instead.',
        },
        tokenName: {
            type: 'string',
            description: 'A unique name for this particular token',
            example: 'some-user',
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
    anyOf: [
        {
            properties: {
                username: {
                    type: 'string',
                },
            },
            required: ['username'],
        },
        {
            properties: {
                tokenName: {
                    type: 'string',
                },
            },
            required: ['tokenName'],
        },
    ],
    components: {},
} as const;

export type ApiTokenSchema = FromSchema<typeof apiTokenSchema>;
