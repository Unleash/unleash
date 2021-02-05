export const addonSimple = {
    addons: [],
    providers: [
        {
            name: 'webhook',
            displayName: 'Webhook',
            parameters: [
                {
                    name: 'url',
                    displayName: 'Webhook URL',
                    type: 'string',
                },
                {
                    name: 'unleashUrl',
                    displayName: 'Unleash Admin UI url',
                    type: 'text',
                },
                {
                    name: 'bodyTemplate',
                    displayName: 'Body template',
                    description: 'You may format the body using a mustache template.',
                    type: 'text',
                },
            ],
            events: ['feature-created', 'feature-updated', 'feature-archived', 'feature-revived'],
        },
    ],
};

export const addonConfig = {
    id: 1,
    provider: 'webhook',
    enabled: true,
    description: null,
    parameters: {
        url: 'http://localhost:4242/webhook',
        bodyTemplate: "{'name': '{{event.data.name}}' }",
    },
    events: ['feature-updated', 'feature-created'],
};

export const addonsWithConfig = {
    addons: [addonConfig],
    providers: [
        {
            name: 'webhook',
            displayName: 'Webhook',
            parameters: [
                {
                    name: 'url',
                    displayName: 'Webhook URL',
                    type: 'string',
                },
                {
                    name: 'unleashUrl',
                    displayName: 'Unleash Admin UI url',
                    type: 'text',
                },
                {
                    name: 'bodyTemplate',
                    displayName: 'Body template',
                    description: 'You may format the body using a mustache template.',
                    type: 'text',
                },
            ],
            events: ['feature-created', 'feature-updated', 'feature-archived', 'feature-revived'],
        },
    ],
};
