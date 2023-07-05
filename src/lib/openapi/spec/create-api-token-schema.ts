import { FromSchema } from 'json-schema-to-ts';
// const tokenNameOptions = [
//     {
//         required: ['tokenName'],
//         properties: {
//             tokenName: {
//                 type: 'string',
//                 description: 'The name of the token.',
//                 example: 'client-token-64522',
//             },
//         },
//     },
//     {
//         required: ['username'],
//         properties: {
//             username: {
//                 deprecated: true,
//                 type: 'string',
//                 description:
//                     'The name of the token. This property is deprecated. Use `tokenName` instead.',
//                 example: 'client-token-64523',
//             },
//         },
//     },
// ] as const;
// TODO: (openapi) this schema isn't entirely correct: `project` and `projects`
// are mutually exclusive.
//
// That is, when creating a token, you can provide either `project` _or_
// `projects`, but *not* both.
//
// Because we allow additional properties, we cannot express the mutual
// exclusiveness in the schema (with OpenAPI 3.0). As such, it's mentioned in
// the description for now.
export const createApiTokenSchema = {
    $id: '#/components/schemas/createApiTokenSchema',
    type: 'object',
    description:
        'The data required to create an [Unleash API token](https://docs.getunleash.io/reference/api-tokens-and-client-keys).',
    properties: {
        expiresAt: {
            type: 'string',
            format: 'date-time',
            description: 'The time when this token should expire.',
            example: '2023-07-04T11:26:24+02:00',
        },
    },
    oneOf: [
        // ...(tokenNameOptions.map((option) => ({
        //     required: [...option.required, 'type'],
        //     properties: {
        //         ...option.properties,
        //         type: {
        //             type: 'string',
        //             pattern: '^[Aa][Dd][Mm][Ii][Nn]$',
        //             description: `An admin token. Must be the string "admin" (not case sensitive).`,
        //             example: 'admin',
        //         },
        //     },
        // })) as const),
        // ...(tokenNameOptions.map((option) => ({
        //     required: [...option.required, 'type'],
        //     properties: {
        //         ...option.properties,
        //         type: {
        //             type: 'string',
        //             pattern:
        //                 '^([Cc][Ll][Ii][Ee][Nn][Tt]|[Ff][Rr][Oo][Nn][Tt][Ee][Nn][Dd])$',
        //             description: `A client or frontend token. Must be one of the strings "client" or "frontend" (not case sensitive).`,
        //             example: 'frontend',
        //         },
        //         environment: {
        //             type: 'string',
        //             description:
        //                 'The environment that the token should be valid for. Defaults to "default"',
        //             example: 'development',
        //         },
        //         project: {
        //             type: 'string',
        //             description:
        //                 'The project that the token should be valid for. Defaults to "*" meaning every project. This property is mutually incompatible with the `projects` property. If you specify one, you cannot specify the other.',
        //             example: 'project-851',
        //         },
        //         projects: {
        //             type: 'array',
        //             description:
        //                 'A list of projects that the token should be valid for. This property is mutually incompatible with the `project` property. If you specify one, you cannot specify the other.',
        //             example: ['project-851', 'project-852'],
        //             items: {
        //                 type: 'string',
        //             },
        //         },
        //     },
        // })) as const),

        // {
        //     required: ['type'],
        //     properties: {
        //         type: {
        //             type: 'string',
        //             pattern: '^[Aa][Dd][Mm][Ii][Nn]$',
        //             description: `An admin token. Must be the string "admin" (not case sensitive).`,
        //             example: 'admin',
        //         },
        //     },
        //     // anyOf: tokenNameOptions,
        // },

        // {
        //     required: ['type'],
        //     properties: {
        //         type: {
        //             type: 'string',
        //             pattern:
        //                 '^([Cc][Ll][Ii][Ee][Nn][Tt]|[Ff][Rr][Oo][Nn][Tt][Ee][Nn][Dd])$',
        //             description: `A client or frontend token. Must be one of the strings "client" or "frontend" (not case sensitive).`,
        //             example: 'frontend',
        //         },
        //         environment: {
        //             type: 'string',
        //             description:
        //                 'The environment that the token should be valid for. Defaults to "default"',
        //             example: 'development',
        //         },
        //         project: {
        //             type: 'string',
        //             description:
        //                 'The project that the token should be valid for. Defaults to "*" meaning every project. This property is mutually incompatible with the `projects` property. If you specify one, you cannot specify the other.',
        //             example: 'project-851',
        //         },
        //         projects: {
        //             type: 'array',
        //             description:
        //                 'A list of projects that the token should be valid for. This property is mutually incompatible with the `project` property. If you specify one, you cannot specify the other.',
        //             example: ['project-851', 'project-852'],
        //             items: {
        //                 type: 'string',
        //             },
        //         },
        //     },
        //     anyOf: tokenNameOptions,
        // },
        {
            allOf: [
                {
                    required: ['type'],
                    type: 'object',
                    properties: {
                        type: {
                            type: 'string',
                            pattern: '^[Aa][Dd][Mm][Ii][Nn]$',
                            description: `An admin token. Must be the string "admin" (not case sensitive).`,
                            example: 'admin',
                        },
                    },
                },
                {
                    type: 'object',
                    required: ['tokenName'],
                    properties: {
                        tokenName: {
                            type: 'string',
                            description: 'The name of the token.',
                            example: 'client-token-64522',
                        },
                    },
                },
            ],
        },
        {
            allOf: [
                {
                    required: ['type'],
                    type: 'object',
                    properties: {
                        type: {
                            type: 'string',
                            pattern: '^[Aa][Dd][Mm][Ii][Nn]$',
                            description: `An admin token. Must be the string "admin" (not case sensitive).`,
                            example: 'admin',
                        },
                    },
                },
                {
                    type: 'object',
                    required: ['username'],
                    properties: {
                        username: {
                            deprecated: true,
                            type: 'string',
                            description:
                                'The name of the token. This property is deprecated. Use `tokenName` instead.',
                            example: 'client-token-64523',
                        },
                    },
                },
            ],
        },
        {
            allOf: [
                {
                    required: ['type'],
                    type: 'object',
                    properties: {
                        type: {
                            type: 'string',
                            pattern:
                                '^([Cc][Ll][Ii][Ee][Nn][Tt]|[Ff][Rr][Oo][Nn][Tt][Ee][Nn][Dd])$',
                            description: `A client or frontend token. Must be one of the strings "client" or "frontend" (not case sensitive).`,
                            example: 'frontend',
                        },
                        environment: {
                            type: 'string',
                            description:
                                'The environment that the token should be valid for. Defaults to "default"',
                            example: 'development',
                        },
                        project: {
                            type: 'string',
                            description:
                                'The project that the token should be valid for. Defaults to "*" meaning every project. This property is mutually incompatible with the `projects` property. If you specify one, you cannot specify the other.',
                            example: 'project-851',
                        },
                        projects: {
                            type: 'array',
                            description:
                                'A list of projects that the token should be valid for. This property is mutually incompatible with the `project` property. If you specify one, you cannot specify the other.',
                            example: ['project-851', 'project-852'],
                            items: {
                                type: 'string',
                            },
                        },
                    },
                },
                {
                    type: 'object',
                    required: ['tokenName'],
                    properties: {
                        tokenName: {
                            type: 'string',
                            description: 'The name of the token.',
                            example: 'client-token-64522',
                        },
                    },
                },
            ],
        },
        {
            allOf: [
                {
                    required: ['type'],
                    type: 'object',
                    properties: {
                        type: {
                            type: 'string',
                            pattern:
                                '^([Cc][Ll][Ii][Ee][Nn][Tt]|[Ff][Rr][Oo][Nn][Tt][Ee][Nn][Dd])$',
                            description: `A client or frontend token. Must be one of the strings "client" or "frontend" (not case sensitive).`,
                            example: 'frontend',
                        },
                        environment: {
                            type: 'string',
                            description:
                                'The environment that the token should be valid for. Defaults to "default"',
                            example: 'development',
                        },
                        project: {
                            type: 'string',
                            description:
                                'The project that the token should be valid for. Defaults to "*" meaning every project. This property is mutually incompatible with the `projects` property. If you specify one, you cannot specify the other.',
                            example: 'project-851',
                        },
                        projects: {
                            type: 'array',
                            description:
                                'A list of projects that the token should be valid for. This property is mutually incompatible with the `project` property. If you specify one, you cannot specify the other.',
                            example: ['project-851', 'project-852'],
                            items: {
                                type: 'string',
                            },
                        },
                    },
                },
                {
                    type: 'object',
                    required: ['username'],
                    properties: {
                        username: {
                            deprecated: true,
                            type: 'string',
                            description:
                                'The name of the token. This property is deprecated. Use `tokenName` instead.',
                            example: 'client-token-64523',
                        },
                    },
                },
            ],
        },
    ],
    components: {},
} as const;

export type CreateApiTokenSchema = FromSchema<typeof createApiTokenSchema>;
