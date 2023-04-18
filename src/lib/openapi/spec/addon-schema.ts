import { FromSchema } from 'json-schema-to-ts';

export const addonSchema = {
    $id: '#/components/schemas/addonSchema',
    type: 'object',
    description: `An [addon](https://docs.getunleash.io/reference/addons) instance description. Contains data about what kind of provider it uses, whether it's enabled or not, what events it listens for, and more.`,
    required: [
        'id',
        'description',
        'provider',
        'enabled',
        'parameters',
        'events',
    ],
    properties: {
        id: {
            type: 'integer',
            minimum: 1,
            example: 27,
            description: "The addon's unique identifier.",
        },
        provider: {
            type: 'string',
            description: `The addon provider, such as "webhook" or "slack".`,
            example: 'webhook',
        },
        description: {
            type: 'string',
            description:
                'A description of the addon. `null` if no description exists.',
            example:
                'This addon posts updates to our internal feature tracking system whenever a feature is created or updated.',
            nullable: true,
        },
        enabled: {
            type: 'boolean',
            description: 'Whether the addon is enabled or not.',
        },
        parameters: {
            type: 'object',
            additionalProperties: {},
            example: {
                url: 'http://localhost:4242/webhook',
            },
            description:
                'Parameters for the addon provider. This object has different required and optional properties depending on the provider you choose.',
        },
        events: {
            type: 'array',
            description: 'The event types that trigger this specific addon.',
            items: {
                type: 'string',
            },
            example: ['feature-created', 'feature-updated'],
        },
        projects: {
            type: 'array',
            description:
                'The projects that this addon listens to events from. An empty list means it listens to events from **all** projects.',
            example: ['new-landing-project', 'signups-v2'],
            items: {
                type: 'string',
            },
        },
        environments: {
            type: 'array',
            description:
                'The list of environments that this addon listens to events from. An empty list means it listens to events from **all** environments.',
            example: ['development', 'production'],
            items: {
                type: 'string',
            },
        },
    },
    components: {},
} as const;

export type AddonSchema = FromSchema<typeof addonSchema>;
