import { FromSchema } from 'json-schema-to-ts';
import { ApiTokenType } from '../../types/models/api-token';

// TODO: (openapi) this schema isn't entirely correct: `project` and `projects`
// are mutually exclusive.
//
// That is, when creating a token, you can provide either `project` _or_
// `projects`, but *not* both.
//
// We should be able to annotate this using `oneOf` and `allOf`, but making
// `oneOf` only valid for _either_ `project` _or_ `projects` is tricky.
//
// I've opened an issue to get some help (thought it was a bug initially).
// There's more info available at:
//
// https://github.com/ajv-validator/ajv/issues/2096
//
// This also applies to apiTokenSchema and potentially other related schemas.

export const createApiTokenSchema = {
    $id: '#/components/schemas/createApiTokenSchema',
    type: 'object',
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
            description: `One of ${Object.values(ApiTokenType).join(', ')}`,
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
    },
    components: {},
} as const;

export type CreateApiTokenSchema = FromSchema<typeof createApiTokenSchema>;
