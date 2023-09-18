import {
    FEATURE_CREATED,
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
    FEATURE_ENVIRONMENT_VARIANTS_UPDATED,
} from '../types/events';
import { IAddonDefinition } from '../types/model';

const slackAppDefinition: IAddonDefinition = {
    name: 'slack-app',
    displayName: 'Slack App',
    description:
        'The Unleash Slack App posts messages to the selected channels in your Slack workspace.',
    howTo: 'Below you can specify which Slack channels receive event notifications. The configuration settings allow you to choose the events and whether you want to filter them by projects and environments.\n\nYou can also select which channels to post to by configuring your feature toggles with “slack” tags. For example, if you’d like the bot to post messages to the #general channel, you can configure your feature toggle with the “slack:general” tag.\n\nThe Unleash Slack App bot has access to public channels by default. If you want the bot to post messages to private channels, you’ll need to invite it to those channels.',
    documentationUrl: 'https://docs.getunleash.io/docs/addons/slack-app',
    installation: {
        url: 'https://unleash-slack-app.vercel.app/install',
        title: 'Slack App installation',
        helpText:
            'After installing the Unleash Slack app in your Slack workspace, paste the access token into the appropriate field below in order to configure this integration.',
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
        {
            name: 'defaultChannels',
            displayName: 'Channels',
            description:
                'A comma-separated list of channels to post the configured events to. These channels are always notified, regardless of the event type or the presence of a slack tag.',
            type: 'text',
            required: false,
            sensitive: false,
        },
    ],
    events: [
        FEATURE_CREATED,
        FEATURE_ARCHIVED,
        FEATURE_REVIVED,
        FEATURE_STALE_ON,
        FEATURE_STALE_OFF,
        FEATURE_ENVIRONMENT_ENABLED,
        FEATURE_ENVIRONMENT_DISABLED,
        FEATURE_ENVIRONMENT_VARIANTS_UPDATED,
        FEATURE_STRATEGY_REMOVE,
        FEATURE_STRATEGY_UPDATE,
        FEATURE_STRATEGY_ADD,
        FEATURE_METADATA_UPDATED,
        FEATURE_VARIANTS_UPDATED,
        FEATURE_PROJECT_CHANGE,
        FEATURE_POTENTIALLY_STALE_ON,
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
