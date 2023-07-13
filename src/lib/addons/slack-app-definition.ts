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

const slackAppDefinition: IAddonDefinition = {
    name: 'slack-app',
    displayName: 'Slack App',
    description:
        'The Unleash Slack App posts messages to your Slack workspace. You can decide which channels to post to by configuring your feature toggles with "slack" tags. For example, if you\'d like the bot to post messages to the #general channel, you should configure your feature toggle with the "slack:general" tag.',
    documentationUrl: 'https://docs.getunleash.io/docs/addons/slack-app',
    alerts: [
        {
            type: 'info',
            text: `The Unleash Slack App bot has access to public channels by default. If you want the bot to post messages to private channels, you'll need to invite it to those channels.`,
        },
        {
            type: 'warning',
            text: `Please ensure you have the Unleash Slack App installed in your Slack workspace if you haven't installed it already.`,
        },
    ],
    installation: {
        url: 'https://unleash-slack-app.vercel.app/install',
        title: 'Slack App installation',
        helpText:
            'After installing the Unleash Slack app in your Slack workspace, paste the access token into the appropriate field below in order to configure this addon.',
    },
    parameters: [
        {
            name: 'accessToken',
            displayName: 'Access token',
            description: '(Required)',
            type: 'text',
            required: true,
            sensitive: true,
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

export default slackAppDefinition;
