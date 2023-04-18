import { FromSchema } from 'json-schema-to-ts';
import { addonParameterSchema } from './addon-parameter-schema';
import { tagTypeSchema } from './tag-type-schema';

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
            example: 'slack',
        },
        displayName: {
            type: 'string',
            description:
                "The addon type's name as it should be displayed in the admin UI.",
            example: 'Slack',
        },
        documentationUrl: {
            type: 'string',
            description:
                'A URL to where you can find more information about using this addon type.',
            example: 'https://docs.getunleash.io/docs/addons/slack',
        },
        description: {
            type: 'string',
            description: 'A description of the addon type.',
            example: 'Allows Unleash to post updates to Slack.',
        },
        tagTypes: {
            type: 'array',
            description: `A list of [Unleash tag types](https://docs.getunleash.io/reference/tags#tag-types) that this addon uses. These tags will be added to the Unleash instance when an addon of this type is created.`,
            example: [
                {
                    name: 'slack',
                    description:
                        'Slack tag used by the slack-addon to specify the slack channel.',
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
        },
        events: {
            type: 'array',
            description:
                'All the [event types](https://docs.getunleash.io/reference/api/legacy/unleash/admin/events#feature-toggle-events) that are available for this addon provider.',
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
    },
    components: {
        schemas: {
            tagTypeSchema,
            addonParameterSchema,
        },
    },
} as const;

export type AddonTypeSchema = FromSchema<typeof addonTypeSchema>;
