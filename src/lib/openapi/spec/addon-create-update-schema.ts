import { FromSchema } from 'json-schema-to-ts';

export const addonCreateUpdateSchema = {
    $id: '#/components/schemas/addonCreateUpdateSchema',
    type: 'object',
    required: ['provider', 'enabled', 'parameters', 'events'],
    description:
        'Data required to create or update an [Unleash addon](https://docs.getunleash.io/reference/addons) instance.',
    properties: {
        provider: {
            type: 'string',

            description: `The addon provider, such as "webhook" or "slack". This string is **case sensitive** and maps to the provider's \`name\` property.

The list of all supported providers and their parameters for a specific Unleash instance can be found by making a GET request to the \`api/admin/addons\` endpoint: the \`providers\` property of that response will contain all available providers.

The default set of providers can be found in the [addons reference documentation](https://docs.getunleash.io/reference/addons). The default supported options are:
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
            description: 'Whether the addon should be enabled or not.',
        },
        parameters: {
            type: 'object',
            additionalProperties: {},
            example: {
                url: 'http://localhost:4242/webhook',
            },
            description:
                'Parameters for the addon provider. This object has different required and optional properties depending on the provider you choose. Consult the documentation for details.',
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

export type AddonCreateUpdateSchema = FromSchema<
    typeof addonCreateUpdateSchema
>;
