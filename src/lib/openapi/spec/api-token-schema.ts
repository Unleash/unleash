import { FromSchema } from 'json-schema-to-ts';
import { ApiTokenType } from '../../types/models/api-token';

export const apiTokenSchema = {
    $id: '#/components/schemas/apiTokenSchema',
    type: 'object',
    additionalProperties: false,
    required: ['type'],
    description: 'An overview of an API token.',
    properties: {
        secret: {
            type: 'string',
            description: 'The token used for authentication.',
            example: 'project:environment.xyzrandomstring',
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
            description: 'The type of API token',
            example: 'client',
        },
        environment: {
            type: 'string',
            description: 'The environment the token has access to.',
            nullable: true,
            example: 'development',
        },
        project: {
            type: 'string',
            description: 'The project this token belongs to.',
            example: 'developerexperience',
        },
        projects: {
            type: 'array',
            description:
                'The list of projects this token has access to. If the token has access to specific projects they will be listed here. If the token has access to all projects it will be represented as [`*`]',
            items: {
                type: 'string',
            },
            example: ['developerexperience', 'enterprisegrowth'],
        },
        expiresAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            description: `The token's expiration date.`,
            example: '2023-04-19T08:15:14.000Z',
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2023-04-19T08:15:14.000Z',
            description: 'When the token was created.',
        },
        seenAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2023-04-19T08:15:14.000Z',
            description:
                'When the token was last seen/used to authenticate with.',
        },
        alias: {
            type: 'string',
            nullable: true,
            description:
                'Not actively used. Present as a legacy format for identifying older tokens',
            example: 'some-alias',
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
