import { FromSchema } from 'json-schema-to-ts';
import { ApiTokenType } from '../../types/models/api-token';

// TODO: (openapi) this schema isn't entirely correct: `project` and `projects` are mutually exclusive.
//
// That is, when creating a token, you can provide either `project` _or_ `projects`, but *not* both.
//
// We should be able to annotate this using `oneOf` and `allOf`, but I'm having some issues with the inbound validation at the moment, and it _may_ be a bug with the package we're using.
//
// I've opened an issue to keep track of it:
//
// https://github.com/ajv-validator/ajv/issues/2096
//
// Until it's resolved: feel free to take a stab at it: it might just be _me_ messing up 😅
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
    },
    components: {},
} as const;

export type CreateApiTokenSchema = FromSchema<typeof createApiTokenSchema>;
