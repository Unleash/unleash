import type { FromSchema } from 'json-schema-to-ts';

export const outdatedSdksSchema = {
    $id: '#/components/schemas/outdatedSdksSchema',
    type: 'object',
    description: 'Data about outdated SDKs that should be upgraded.',
    additionalProperties: false,
    required: ['sdks'],
    properties: {
        sdks: {
            type: 'array',
            description: 'A list of SDKs',
            items: {
                type: 'object',
                required: ['sdkVersion', 'applications'],
                additionalProperties: false,
                properties: {
                    sdkVersion: {
                        type: 'string',
                        description:
                            'An outdated SDK version identifier. Usually formatted as "unleash-client-<language>:<version>"',
                        example: 'unleash-client-java:7.0.0',
                    },
                    applications: {
                        type: 'array',
                        items: {
                            description: 'Name of the application',
                            type: 'string',
                            example: 'accounting',
                        },
                        description:
                            'A list of applications using the SDK version',
                    },
                },
            },
        },
    },
    components: {},
} as const;

export type OutdatedSdksSchema = FromSchema<typeof outdatedSdksSchema>;
