import type { FromSchema } from 'json-schema-to-ts';
import { ApiTokenType } from '../../types/model.js';

export const edgeTokenSchema = {
    $id: '#/components/schemas/edgeTokenSchema',
    type: 'object',
    additionalProperties: false,
    required: ['token', 'projects', 'type'],
    description:
        'A representation of a client token, limiting access to [CLIENT](https://docs.getunleash.io/concepts/api-tokens-and-client-keys#backend-tokens) (used by serverside SDKs) or [FRONTEND](https://docs.getunleash.io/concepts/api-tokens-and-client-keys#frontend-tokens) (used by proxy SDKs)',
    properties: {
        projects: {
            description:
                'The list of projects this token has access to. If the token has access to specific projects they will be listed here. If the token has access to all projects it will be represented as [`*`]',
            type: 'array',
            items: {
                type: 'string',
            },
            example: ['developerexperience', 'enterprisegrowth'],
        },
        type: {
            description: `The [API token](https://docs.getunleash.io/concepts/api-tokens-and-client-keys)'s **type**. Unleash supports three different types of API tokens ([ADMIN](https://docs.getunleash.io/concepts/api-tokens-and-client-keys#admin-tokens), [CLIENT](https://docs.getunleash.io/concepts/api-tokens-and-client-keys#backend-tokens), [FRONTEND](https://docs.getunleash.io/concepts/api-tokens-and-client-keys#frontend-tokens)). They all have varying access, so when validating a token it's important to know what kind you're dealing with`,
            type: 'string',
            enum: Object.values(ApiTokenType),
            example: 'client',
        },
        token: {
            description:
                'The actual token value. [Unleash API tokens](https://docs.getunleash.io/concepts/api-tokens-and-client-keys) are comprised of three parts. <project(s)>:<environment>.randomcharacters',
            type: 'string',
            example:
                '*:development.5c806b5320c88cf27e81f3e9b97dab298a77d5879316e3c2d806206b',
        },
    },
    components: {},
} as const;

export type EdgeTokenSchema = FromSchema<typeof edgeTokenSchema>;
