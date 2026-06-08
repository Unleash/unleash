const dynamicConfigurationPayloadSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['type', 'value'],
    properties: {
        type: {
            type: 'string',
            enum: ['json', 'string', 'number'],
            description: 'The payload type.',
        },
        value: {
            type: 'string',
            description: 'The payload value as a string.',
        },
    },
} as const;

export const clientDynamicConfigurationsSchema = {
    $id: '#/components/schemas/clientDynamicConfigurationsSchema',
    description:
        'Dynamic configurations compiled into a configuration-native document with Yggdrasil-style expressions.',
    type: 'object',
    additionalProperties: false,
    required: ['formatVersion', 'configurations', 'meta'],
    properties: {
        formatVersion: {
            type: 'number',
            description: 'The dynamic configuration document format version.',
            example: 1,
        },
        configurations: {
            type: 'array',
            description:
                'Versioned configuration resources with Yggdrasil-style selectors.',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['name', 'project', 'type', 'versions', 'rules'],
                properties: {
                    name: {
                        type: 'string',
                        description: 'The configuration key.',
                    },
                    project: {
                        type: 'string',
                        description: 'The owning project.',
                    },
                    type: {
                        type: 'string',
                        enum: ['string', 'number', 'boolean', 'json'],
                        description: 'The configuration value type.',
                    },
                    versions: {
                        type: 'array',
                        minItems: 1,
                        description:
                            'Immutable values addressable by configuration rules and feature variant references.',
                        items: {
                            type: 'object',
                            additionalProperties: false,
                            required: ['version', 'payload'],
                            properties: {
                                version: {
                                    type: 'integer',
                                    minimum: 1,
                                },
                                payload: {
                                    ...dynamicConfigurationPayloadSchema,
                                },
                            },
                        },
                    },
                    rules: {
                        type: 'array',
                        minItems: 1,
                        description:
                            'Ordered Yggdrasil-style rules. Every rule selects a required configuration version, the first matching rule wins, and the final rule is the unconditional default.',
                        items: {
                            type: 'object',
                            additionalProperties: false,
                            required: ['expression', 'version'],
                            properties: {
                                expression: {
                                    type: 'string',
                                    description:
                                        'A Yggdrasil-like boolean expression.',
                                },
                                version: {
                                    type: 'integer',
                                    minimum: 1,
                                    description:
                                        'The version selected when the expression matches.',
                                },
                            },
                        },
                    },
                },
            },
        },
        meta: {
            type: 'object',
            description:
                'Revision and cache metadata for the compiled configuration snapshot.',
            additionalProperties: false,
            required: ['revisionId', 'etag', 'generatedAt'],
            properties: {
                revisionId: { type: 'integer' },
                etag: { type: 'string' },
                generatedAt: { type: 'string', format: 'date-time' },
            },
        },
    },
    components: {
        schemas: {},
    },
} as const;
