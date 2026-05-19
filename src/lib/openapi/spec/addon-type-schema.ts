import type { FromSchema } from 'json-schema-to-ts';
import { addonParameterSchema } from './addon-parameter-schema.js';
import { tagTypeSchema } from './tag-type-schema.js';

export const addonTypeSchema = {
    $id: '#/components/schemas/addonTypeSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'displayName', 'documentationUrl', 'description'],
    description:
        'An addon provider. Defines a specific addon type and what the end user must configure when creating a new addon of that type.',
    properties: {
        name: {
            type: 'string',
            description:
                "The name of the addon type. When creating new addons, this goes in the payload's `type` field.",
            example: 'my-app',
        },
        displayName: {
            type: 'string',
            description:
                "The addon type's name as it should be displayed in the admin UI.",
            example: 'App for Unleash',
        },
        documentationUrl: {
            type: 'string',
            description:
                'A URL to where you can find more information about using this addon type.',
            example: 'https://docs.getunleash.io/integrate/',
        },
        description: {
            type: 'string',
            description: 'A description of the addon type.',
            example: 'The Unleash App for X.',
        },
        howTo: {
            type: 'string',
            description:
                'A long description of how to use this addon type. This will be displayed on the top of configuration page. Can contain markdown.',
            example:
                'This is **how you use** this addon type...\n  - Step 1\n  - Step 2\n  - Step 3',
        },
        tagTypes: {
            type: 'array',
            description: `A list of [Unleash tag types](https://docs.getunleash.io/concepts/feature-flags#tags) that this addon uses. These tags will be added to the Unleash instance when an addon of this type is created.`,
            example: [
                {
                    name: 'addon-name',
                    description:
                        'Addon tag used by the addon to specify the unleash config.',
                    icon: 'S',
                },
            ],
            items: {
                $ref: '#/components/schemas/tagTypeSchema',
            },
        },
        parameters: {
            type: 'array',
            description:
                "The addon provider's parameters. Use these to configure an addon of this provider type. Items with `required: true` must be provided.",
            items: {
                $ref: '#/components/schemas/addonParameterSchema',
            },
            example: [
                {
                    name: 'url',
                    displayName: 'Addon URL',
                    description: '(Required)',
                    type: 'url',
                    required: true,
                    sensitive: true,
                },
                {
                    name: 'username',
                    displayName: 'Username',
                    placeholder: 'Unleash',
                    description: 'The username to use when using the addon.',
                    type: 'text',
                    required: false,
                    sensitive: false,
                },
                {
                    name: 'emojiIcon',
                    displayName: 'Emoji Icon',
                    placeholder: ':unleash:',
                    description:
                        'The emoji_icon to use when posting messages. Defaults to ":unleash:".',
                    type: 'text',
                    required: false,
                    sensitive: false,
                },
                {
                    name: 'defaultChannel',
                    displayName: 'Default channel',
                    description:
                        '(Required) Default channel to post updates to if not specified in the addon-tag',
                    type: 'text',
                    required: true,
                    sensitive: false,
                },
            ],
        },
        events: {
            type: 'array',
            description:
                'All the [event types](https://docs.getunleash.io/concepts/events#event-types) that are available for this addon provider.',
            items: {
                type: 'string',
            },
            example: [
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
        installation: {
            type: 'object',
            additionalProperties: false,
            required: ['url'],
            description: 'The installation configuration for this addon type.',
            properties: {
                url: {
                    type: 'string',
                    description:
                        'A URL to where the addon configuration should redirect to install addons of this type.',
                    example: 'https://app-for-install.getunleash.io/install',
                },
                title: {
                    type: 'string',
                    description:
                        'The title of the installation configuration. This will be displayed to the user when installing addons of this type.',
                    example: 'App for Unleash installation',
                },
                helpText: {
                    type: 'string',
                    description:
                        'The help text of the installation configuration. This will be displayed to the user when installing addons of this type.',
                    example:
                        'Clicking the Install button will send you to Addon to initiate the installation procedure for the Unleash App for App for your workspace',
                },
            },
        },
        alerts: {
            type: 'array',
            description:
                'A list of alerts to display to the user when installing addons of this type.',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['type', 'text'],
                properties: {
                    type: {
                        type: 'string',
                        enum: ['success', 'info', 'warning', 'error'],
                        description:
                            'The type of alert. This determines the color of the alert.',
                        example: 'info',
                    },
                    text: {
                        type: 'string',
                        description:
                            'The text of the alert. This is what will be displayed to the user.',
                        example:
                            'Please ensure you have the Unleash App for X installed.',
                    },
                    link: {
                        type: 'object',
                        additionalProperties: false,
                        required: ['url'],
                        description:
                            'An optional link to display at the end of the alert text.',
                        properties: {
                            url: {
                                type: 'string',
                                description: 'The URL of the link.',
                                example:
                                    'https://docs.getunleash.io/integrate/slack-app',
                            },
                            title: {
                                type: 'string',
                                nullable: true,
                                description: 'The display title of the link.',
                                example:
                                    'Read these instructions to migrate to new Slack App smoothly.',
                            },
                        },
                    },
                },
            },
        },
        deprecated: {
            type: 'string',
            description:
                'This should be used to inform the user that this addon type is deprecated and should not be used. Deprecated addons will show a badge with this information on the UI.',
            example:
                'This integration is deprecated. Please try the new integration instead.',
        },
    },
    components: {
        schemas: {
            tagTypeSchema,
            addonParameterSchema,
        },
    },
} as const;

export type AddonTypeSchema = FromSchema<typeof addonTypeSchema>;
