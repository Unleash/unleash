import {
    FEATURE_CREATED,
    FEATURE_UPDATED,
    FEATURE_ARCHIVED,
    FEATURE_REVIVED,
    FEATURE_STALE_ON,
    FEATURE_STALE_OFF,
    FEATURE_ENVIRONMENT_ENABLED,
    FEATURE_ENVIRONMENT_DISABLED,
    FEATURE_STRATEGY_REMOVE,
    FEATURE_STRATEGY_UPDATE,
    FEATURE_STRATEGY_ADD,
    FEATURE_METADATA_UPDATED,
    FEATURE_PROJECT_CHANGE,
    FEATURE_VARIANTS_UPDATED,
    FEATURE_POTENTIALLY_STALE_ON,
    RELEASE_PLAN_PROGRESSIONS_PAUSED,
    RELEASE_PLAN_PROGRESSIONS_RESUMED,
} from '../events/index.js';
import type { IAddonDefinition } from '../types/model.js';

const slackDefinition: IAddonDefinition = {
    name: 'slack',
    displayName: 'Slack',
    description: 'Allows Unleash to post updates to Slack.',
    documentationUrl: 'https://docs.getunleash.io/docs/addons/slack',
    deprecated:
        'This integration is deprecated. Please try the new App for Slack integration instead.',
    alerts: [
        {
            type: 'warning',
            text: `This integration is deprecated. Please try the new App for Slack integration instead.`,
        },
    ],
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
        {
            name: 'customHeaders',
            displayName: 'Extra HTTP Headers',
            placeholder: `{
  "ISTIO_USER_KEY": "hunter2",
  "SOME_OTHER_CUSTOM_HTTP_HEADER": "SOMEVALUE"
}`,
            description: `(Optional) Used to add extra HTTP Headers to the request the plugin fires off. This must be a valid json object of key-value pairs where both the key and the value are strings`,
            required: false,
            sensitive: true,
            type: 'textfield',
        },
    ],
    events: [
        FEATURE_CREATED,
        FEATURE_UPDATED,
        FEATURE_ARCHIVED,
        FEATURE_REVIVED,
        FEATURE_STALE_ON,
        FEATURE_STALE_OFF,
        FEATURE_ENVIRONMENT_ENABLED,
        FEATURE_ENVIRONMENT_DISABLED,
        FEATURE_STRATEGY_REMOVE,
        FEATURE_STRATEGY_UPDATE,
        FEATURE_STRATEGY_ADD,
        FEATURE_METADATA_UPDATED,
        FEATURE_VARIANTS_UPDATED,
        FEATURE_PROJECT_CHANGE,
        FEATURE_POTENTIALLY_STALE_ON,
        RELEASE_PLAN_PROGRESSIONS_PAUSED,
        RELEASE_PLAN_PROGRESSIONS_RESUMED,
    ],
    tagTypes: [
        {
            name: 'slack',
            description:
                'Slack tag used by the slack-addon to specify the slack channel.',
            icon: 'S',
        },
    ],
};

export default slackDefinition;
