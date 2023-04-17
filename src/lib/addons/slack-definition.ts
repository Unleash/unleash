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
} from '../types/events';
import { IAddonDefinition } from '../types/model';

const slackDefinition: IAddonDefinition = {
    name: 'slack',
    displayName: 'Slack',
    description: 'Allows Unleash to post updates to Slack.',
    documentationUrl: 'https://docs.getunleash.io/docs/addons/slack',
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
