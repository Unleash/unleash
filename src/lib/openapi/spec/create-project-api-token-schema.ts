import type { FromSchema } from 'json-schema-to-ts';

export const createProjectApiTokenSchema = {
    type: 'object',
    required: ['tokenName', 'type'],
    $id: '#/components/schemas/createProjectApiTokenSchema',
    description:
        'The schema for creating a project API token. This schema is used to create a new project API token.',
    properties: {
        type: {
            type: 'string',
            pattern:
                '^([Cc][Ll][Ii][Ee][Nn][Tt]|[Bb][Aa][Cc][Kk][Ee][Nn][Dd]|[Ff][Rr][Oo][Nn][Tt][Ee][Nn][Dd])$',
            description: `A client or frontend token. Must be one of the strings "client" (deprecated), "backend" (preferred over "client") or "frontend" (not case sensitive).`,
            example: 'frontend',
        },
        environment: {
            type: 'string',
            description:
                'The environment that the token should be valid for. Defaults to "default".',
            example: 'development',
            default: 'default',
        },
        expiresAt: {
            type: 'string',
            description:
                'The date and time when the token should expire. The date should be in ISO 8601 format.',
            example: '2023-10-01T00:00:00Z',
            format: 'date-time',
        },
        tokenName: {
            type: 'string',
            description: 'A unique name for this particular token',
            example: 'some-user',
        },
        projects: {
            type: 'array',
            description:
                'The project IDs this token should have access to. When omitted, defaults to the project specified in the URL.',
            items: {
                type: 'string',
            },
        },
    },
    components: {},
} as const;
export type CreateProjectApiTokenSchema = FromSchema<
    typeof createProjectApiTokenSchema
>;
