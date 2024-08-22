import type { FromSchema } from 'json-schema-to-ts';
import { versionSchema } from './version-schema';
import { variantFlagSchema } from './variant-flag-schema';
import { resourceLimitsSchema } from './resource-limits-schema';

export const uiConfigSchema = {
    $id: '#/components/schemas/uiConfigSchema',
    type: 'object',
    additionalProperties: false,
    description:
        'A collection of properties used to configure the Unleash Admin UI.',
    required: ['version', 'unleashUrl', 'baseUriPath', 'versionInfo'],
    properties: {
        slogan: {
            type: 'string',
            description: 'The slogan to display in the UI footer.',
            example: 'The enterprise-ready feature flag service.',
        },
        name: {
            type: 'string',
            description:
                'The name of this Unleash instance. Used to build the text in the footer.',
            example: 'Unleash enterprise',
        },
        version: {
            type: 'string',
            description: 'The current version of Unleash',
            example: '5.3.0-main',
        },
        environment: {
            type: 'string',
            description:
                'What kind of Unleash instance it is: Enterprise, Pro, or Open source',
            example: 'Enterprise',
        },
        unleashUrl: {
            type: 'string',
            description: 'The URL of the Unleash instance.',
            example: 'https://unleash.mycompany.com/enterprise',
        },
        baseUriPath: {
            type: 'string',
            description:
                'The base URI path at which this Unleash instance is listening.',
            example: '/enterprise',
        },
        feedbackUriPath: {
            type: 'string',
            description:
                'The URI path at which the feedback endpoint is listening.',
            example: '/feedback',
        },
        disablePasswordAuth: {
            type: 'boolean',
            description:
                'Whether password authentication should be disabled or not.',
            example: false,
        },
        emailEnabled: {
            type: 'boolean',
            description: 'Whether this instance can send out emails or not.',
            example: true,
        },
        maintenanceMode: {
            type: 'boolean',
            description: 'Whether maintenance mode is currently active or not.',
            example: false,
        },
        segmentValuesLimit: {
            type: 'number',
            description:
                'The maximum number of values that can be used in a single segment.',
            example: 1000,
            deprecated: true,
        },
        strategySegmentsLimit: {
            type: 'number',
            description:
                'The maximum number of segments that can be applied to a single strategy.',
            example: 5,
            deprecated: true,
        },
        resourceLimits: {
            $ref: resourceLimitsSchema.$id,
            description: resourceLimitsSchema.description,
            example: {
                ...Object.entries(resourceLimitsSchema.properties).reduce(
                    (acc, [prop, { example }]) => ({
                        ...acc,
                        [prop]: example,
                    }),
                    {},
                ),
            },
        },
        networkViewEnabled: {
            type: 'boolean',
            description: 'Whether to enable the Unleash network view or not.',
            example: true,
        },
        frontendApiOrigins: {
            type: 'array',
            description:
                'The list of origins that the front-end API should accept requests from.',
            example: ['*'],
            items: {
                type: 'string',
            },
        },
        flags: {
            type: 'object',
            description:
                'Additional (largely experimental) features that are enabled in this Unleash instance.',
            example: {
                messageBanner: {
                    name: 'disabled',
                    enabled: false,
                },
                featuresExportImport: true,
            },
            additionalProperties: {
                anyOf: [
                    {
                        type: 'boolean',
                    },
                    {
                        $ref: '#/components/schemas/variantFlagSchema',
                    },
                ],
            },
        },
        links: {
            description: 'Relevant links to use in the UI.',
            example: [
                {
                    value: 'Documentation',
                    icon: 'library_books',
                    href: 'https://docs.getunleash.io/docs',
                    title: 'User documentation',
                },
                {
                    value: 'GitHub',
                    icon: 'c_github',
                    href: 'https://github.com/Unleash/unleash',
                    title: 'Source code on GitHub',
                },
            ],
            'x-enforcer-exception-skip-codes': 'WSCH006', // allow additional properties in example (openapi enforcer)
            type: 'array',
            items: {
                type: 'object',
            },
        },
        authenticationType: {
            type: 'string',
            description:
                'The type of authentication enabled for this Unleash instance',
            example: 'enterprise',
            enum: [
                'open-source',
                'demo',
                'enterprise',
                'hosted',
                'custom',
                'none',
            ],
        },
        versionInfo: {
            $ref: '#/components/schemas/versionSchema',
        },
        oidcConfiguredThroughEnv: {
            type: 'boolean',
            description:
                'Whether the OIDC configuration is set through environment variables or not.',
            example: false,
        },
        samlConfiguredThroughEnv: {
            type: 'boolean',
            description:
                'Whether the SAML configuration is set through environment variables or not.',
            example: false,
        },
    },
    components: {
        schemas: {
            versionSchema,
            variantFlagSchema,
            resourceLimitsSchema,
        },
    },
} as const;

export type UiConfigSchema = FromSchema<typeof uiConfigSchema>;
