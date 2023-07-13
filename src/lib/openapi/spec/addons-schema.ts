import { FromSchema } from 'json-schema-to-ts';
import { addonSchema } from './addon-schema';
import { addonTypeSchema } from './addon-type-schema';
import { addonParameterSchema } from './addon-parameter-schema';
import { tagTypeSchema } from './tag-type-schema';

export const addonsSchema = {
    $id: '#/components/schemas/addonsSchema',
    type: 'object',
    required: ['addons', 'providers'],
    description: `An object containing two things:
1. A list of all [addons](https://docs.getunleash.io/reference/addons) defined on this Unleash instance
2. A list of all addon providers defined on this instance`,
    properties: {
        addons: {
            type: 'array',
            description:
                'All the addons that exist on this instance of Unleash.',
            items: {
                $ref: '#/components/schemas/addonSchema',
            },
        },
        providers: {
            type: 'array',
            description:
                'A list of  all available addon providers, along with their parameters and descriptions.',
            example: [
                {
                    name: 'webhook',
                    displayName: 'Webhook',
                    description:
                        'A Webhook is a generic way to post messages from Unleash to third party services.',
                    documentationUrl:
                        'https://docs.getunleash.io/docs/addons/webhook',
                    parameters: [
                        {
                            name: 'url',
                            displayName: 'Webhook URL',
                            description:
                                '(Required) Unleash will perform a HTTP Post to the specified URL (one retry if first attempt fails)',
                            type: 'url',
                            required: true,
                            sensitive: true,
                        },
                        {
                            name: 'contentType',
                            displayName: 'Content-Type',
                            placeholder: 'application/json',
                            description:
                                '(Optional) The Content-Type header to use. Defaults to "application/json".',
                            type: 'text',
                            required: false,
                            sensitive: false,
                        },
                        {
                            name: 'authorization',
                            displayName: 'Authorization',
                            placeholder: '',
                            description:
                                '(Optional) The Authorization header to use. Not used if left blank.',
                            type: 'text',
                            required: false,
                            sensitive: true,
                        },
                        {
                            name: 'bodyTemplate',
                            displayName: 'Body template',
                            placeholder:
                                '{\n  "event": "{{event.type}}",\n  "createdBy": "{{event.createdBy}}",\n  "featureToggle": "{{event.data.name}}",\n  "timestamp": "{{event.data.createdAt}}"\n}',
                            description:
                                "(Optional) You may format the body using a mustache template. If you don't specify anything, the format will similar to the events format (https://docs.getunleash.io/reference/api/legacy/unleash/admin/events)",
                            type: 'textfield',
                            required: false,
                            sensitive: false,
                        },
                    ],
                    events: [
                        'feature-created',
                        'feature-updated',
                        'feature-archived',
                        'feature-revived',
                        'feature-stale-on',
                        'feature-stale-off',
                        'feature-environment-enabled',
                        'feature-environment-disabled',
                        'feature-strategy-remove',
                        'feature-strategy-update',
                        'feature-strategy-add',
                        'feature-metadata-updated',
                        'feature-variants-updated',
                        'feature-project-change',
                        'feature-tagged',
                        'feature-untagged',
                        'change-request-created',
                        'change-request-discarded',
                        'change-added',
                        'change-discarded',
                        'change-request-approved',
                        'change-request-approval-added',
                        'change-request-cancelled',
                        'change-request-sent-to-review',
                        'change-request-applied',
                    ],
                },
                {
                    name: 'slack',
                    displayName: 'Slack',
                    description: 'Allows Unleash to post updates to Slack.',
                    documentationUrl:
                        'https://docs.getunleash.io/docs/addons/slack',
                    parameters: [
                        {
                            name: 'url',
                            displayName: 'Slack webhook URL',
                            description: '(Required)',
                            type: 'url',
                            required: true,
                            sensitive: true,
                        },
                        {
                            name: 'username',
                            displayName: 'Username',
                            placeholder: 'Unleash',
                            description:
                                'The username to use when posting messages to slack. Defaults to "Unleash".',
                            type: 'text',
                            required: false,
                            sensitive: false,
                        },
                        {
                            name: 'emojiIcon',
                            displayName: 'Emoji Icon',
                            placeholder: ':unleash:',
                            description:
                                'The emoji_icon to use when posting messages to slack. Defaults to ":unleash:".',
                            type: 'text',
                            required: false,
                            sensitive: false,
                        },
                        {
                            name: 'defaultChannel',
                            displayName: 'Default channel',
                            description:
                                '(Required) Default channel to post updates to if not specified in the slack-tag',
                            type: 'text',
                            required: true,
                            sensitive: false,
                        },
                    ],
                    events: [
                        'feature-created',
                        'feature-updated',
                        'feature-archived',
                        'feature-revived',
                        'feature-stale-on',
                        'feature-stale-off',
                        'feature-environment-enabled',
                        'feature-environment-disabled',
                        'feature-strategy-remove',
                        'feature-strategy-update',
                        'feature-strategy-add',
                        'feature-metadata-updated',
                        'feature-variants-updated',
                        'feature-project-change',
                    ],
                    tagTypes: [
                        {
                            name: 'slack',
                            description:
                                'Slack tag used by the slack-addon to specify the slack channel.',
                            icon: 'S',
                        },
                    ],
                },
                {
                    name: 'teams',
                    displayName: 'Microsoft Teams',
                    description:
                        'Allows Unleash to post updates to Microsoft Teams.',
                    documentationUrl:
                        'https://docs.getunleash.io/docs/addons/teams',
                    parameters: [
                        {
                            name: 'url',
                            displayName: 'Microsoft Teams webhook URL',
                            description: '(Required)',
                            type: 'url',
                            required: true,
                            sensitive: true,
                        },
                    ],
                    events: [
                        'feature-created',
                        'feature-updated',
                        'feature-archived',
                        'feature-revived',
                        'feature-stale-on',
                        'feature-stale-off',
                        'feature-environment-enabled',
                        'feature-environment-disabled',
                        'feature-strategy-remove',
                        'feature-strategy-update',
                        'feature-strategy-add',
                        'feature-metadata-updated',
                        'feature-variants-updated',
                        'feature-project-change',
                    ],
                },
                {
                    name: 'datadog',
                    displayName: 'Datadog',
                    description: 'Allows Unleash to post updates to Datadog.',
                    documentationUrl:
                        'https://docs.getunleash.io/docs/addons/datadog',
                    parameters: [
                        {
                            name: 'url',
                            displayName: 'Datadog Events URL',
                            description:
                                'Default url: https://api.datadoghq.com/api/v1/events. Needs to be changed if your not using the US1 site.',
                            type: 'url',
                            required: false,
                            sensitive: false,
                        },
                        {
                            name: 'apiKey',
                            displayName: 'Datadog API key',
                            placeholder: 'j96c23b0f12a6b3434a8d710110bd862',
                            description: '(Required) API key from Datadog',
                            type: 'text',
                            required: true,
                            sensitive: true,
                        },
                    ],
                    events: [
                        'feature-created',
                        'feature-updated',
                        'feature-archived',
                        'feature-revived',
                        'feature-stale-on',
                        'feature-stale-off',
                        'feature-environment-enabled',
                        'feature-environment-disabled',
                        'feature-strategy-remove',
                        'feature-strategy-update',
                        'feature-strategy-add',
                        'feature-metadata-updated',
                        'feature-project-change',
                        'feature-variants-updated',
                    ],
                    tagTypes: [
                        {
                            name: 'datadog',
                            description:
                                'All Datadog tags added to a specific feature are sent to datadog event stream.',
                            icon: 'D',
                        },
                    ],
                },
            ],
            items: {
                $ref: '#/components/schemas/addonTypeSchema',
            },
        },
    },
    components: {
        schemas: {
            addonSchema,
            addonTypeSchema,
            tagTypeSchema,
            addonParameterSchema,
        },
    },
} as const;

export type AddonsSchema = FromSchema<typeof addonsSchema>;
