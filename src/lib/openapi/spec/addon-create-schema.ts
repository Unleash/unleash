import { FromSchema } from 'json-schema-to-ts';
import { slackParameters } from 'lib/addons/slack-definition';

type Param = {
    name: string;
    displayName: string;
    description: string;
    type: 'url' | 'text';
    required: boolean;
    placeholder?: string;
};

const paramsToOpenAPI = (ps: readonly Param[]) => {
    const required = ps.filter((p) => p.required).map((p) => p.name);
    const properties = ps.reduce((acc, p) => {
        const type =
            p.type === 'url'
                ? { type: 'string', format: 'uri' }
                : { type: 'string' };

        acc[p.name] = {
            type,
            description: p.description,
            example: p.placeholder || '< no example >',
        };
        return acc;
    }, {});

    return { required, properties, type: 'object' };
};

const providerSlack = {
    type: 'object',
    required: ['provider', 'parameters'],
    properties: {
        provider: {
            type: 'string',
            enum: ['slack'],
        },
        parameters: paramsToOpenAPI(slackParameters),
    },
} as const;

export const addonCreateSchema2 = {
    $id: '#/components/schemas/addonSchema',
    type: 'object',
    allOf: [
        {
            required: ['provider', 'enabled', 'parameters', 'events'],
            properties: {
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
        },
        providerSlack,
    ],
    components: {},
} as const;

export type AddonCreateSchema = FromSchema<typeof addonCreateSchema2>;
