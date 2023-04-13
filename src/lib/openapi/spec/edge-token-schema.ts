import { FromSchema } from 'json-schema-to-ts';
import { ApiTokenType } from '../../types/models/api-token';

export const edgeTokenSchema = {
    $id: '#/components/schemas/edgeTokenSchema',
    type: 'object',
    additionalProperties: false,
    required: ['token', 'projects', 'type'],
    description:
        'A representation of a client token, limiting access to [CLIENT](https://docs.getunleash.io/reference/api-tokens-and-client-keys#client-tokens) (used by serverside SDKs) or [FRONTEND](https://docs.getunleash.io/reference/api-tokens-and-client-keys#front-end-tokens) (used by proxy SDKs)',
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
            description: `The [API token](https://docs.getunleash.io/reference/api-tokens-and-client-keys#api-tokens)'s **type**. Unleash supports three different types of API tokens ([ADMIN](https://docs.getunleash.io/reference/api-tokens-and-client-keys#admin-tokens), [CLIENT](https://docs.getunleash.io/reference/api-tokens-and-client-keys#client-tokens), [FRONTEND](https://docs.getunleash.io/reference/api-tokens-and-client-keys#front-end-tokens)). They all have varying access, so when validating a token it's important to know what kind you're dealing with`,
            type: 'string',
            enum: Object.values(ApiTokenType),
            example: 'client',
        },
        token: {
            description:
                'The actual token value. [Unleash API tokens](https://docs.getunleash.io/reference/api-tokens-and-client-keys) are comprised of three parts. <project(s)>:<environment>.randomcharacters',
            type: 'string',
            example:
                '*:development.5c806b5320c88cf27e81f3e9b97dab298a77d5879316e3c2d806206b',
        },
    },
    components: {},
} as const;

export type EdgeTokenSchema = FromSchema<typeof edgeTokenSchema>;
