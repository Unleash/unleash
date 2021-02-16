'use strict';

const {
    FEATURE_CREATED,
    FEATURE_UPDATED,
    FEATURE_ARCHIVED,
    FEATURE_REVIVED,
    FEATURE_STALE_ON,
    FEATURE_STALE_OFF,
} = require('../event-type');

module.exports = {
    name: 'slack',
    displayName: 'Slack',
    description: 'Allows Unleash to post updates to Slack.',
    documentationUrl: 'https://unleash.github.io/docs/addons/slack',
    parameters: [
        {
            name: 'url',
            displayName: 'Slack webhook URL',
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
        },
        {
            name: 'emojiIcon',
            displayName: 'Emoji Icon',
            placeholder: ':unleash:',
            description:
                'The emoji_icon to use when posting messages to slack. Defaults to ":unleash:".',
            type: 'text',
            required: false,
        },
        {
            name: 'defaultChannel',
            displayName: 'Default channel',
            description:
                'Default channel to post updates to if not specified in the slack-tag',
            type: 'text',
            required: true,
        },
    ],
    events: [
        FEATURE_CREATED,
        FEATURE_UPDATED,
        FEATURE_ARCHIVED,
        FEATURE_REVIVED,
        FEATURE_STALE_ON,
        FEATURE_STALE_OFF,
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
