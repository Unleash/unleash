import { FromSchema } from 'json-schema-to-ts';

export const addonSchema = {
    $id: '#/components/schemas/addonSchema',
    type: 'object',
    required: ['provider', 'enabled', 'parameters', 'events'],
    properties: {
        id: {
            type: 'integer',
            minimum: 1,
            example: 27,
            description: "The addon's unique identifier.",
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'The time when the addon was originally created.',
            example: '2023-03-31T07:50:54Z',
            // nullable: true, // <— when is this ever nullable?
            // this is also not required? and my addons don't have that field. wut?
        },
        provider: {
            type: 'string',

            // enum: ['webhook', 'datadog', 'slack', 'teams'], // get list of providers here
            description: `The addon provider, such as "webhook" or "slack". The list of all providers supported can be found in the [addons reference documentation](https://docs.getunleash.io/reference/addons). This string is **case sensitive**. Supported options are:
- \`datadog\` for [Datadog](https://docs.getunleash.io/reference/addons/datadog)
- \`slack\` for [Slack](https://docs.getunleash.io/reference/addons/slack)
- \`teams\` for [Microsoft Teams](https://docs.getunleash.io/reference/addons/teams)
- \`webhook\` for [webhooks](https://docs.getunleash.io/reference/addons/webhook)

The provider you choose for your addon dictates what properties the \`parameters\` object needs. Refer to the documentation for each provider for more information.
`,
            example: 'webhook',
        },
        description: {
            type: 'string',
            description: 'A description of the addon.',
            example:
                'This addon posts updates to our internal feature tracking system whenever a feature is created or updated.',
        },
        enabled: {
            type: 'boolean',
            description: 'Whether the addon is enabled or not.',
        },
        parameters: {
            type: 'object',
            additionalProperties: true,
            example: {
                url: 'http://localhost:4242/webhook',
            },
            description:
                'Parameters for the addon provider. This object has different required and optional properties depending on the provider you choose.',
        },
        events: {
            type: 'array',
            description:
                'The event types that will trigger this specific addon.',
            items: {
                type: 'string',
            },
            example: ['feature-created', 'feature-updated'],
        },
        projects: {
            type: 'array',
            description:
                'The projects that this addon will listen to events from. An empty list means it will listen to events from **all** projects.',
            example: ['new-landing-project', 'signups-v2'],
            items: {
                type: 'string',
            },
        },
        environments: {
            type: 'array',
            description:
                'The list of environments that this addon will listen to events from. An empty list means it will listen to events from **all** environments.',
            example: ['development', 'production'],
            items: {
                type: 'string',
            },
        },
    },
    components: {},
} as const;

export type AddonSchema = FromSchema<typeof addonSchema>;

// "provider" and "parameters" are coupled. Can we make use of the addon service to make those hang together?
// can we use     getProviderDefinitions(): IAddonDefinition[] {
