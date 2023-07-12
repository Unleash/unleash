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
    description: 'Allows Unleash to post updates to Slack.',
    documentationUrl: 'https://docs.getunleash.io/docs/addons/slack-app',
    configureInstall: {
        url: 'https://unleash-slack-app.vercel.app/install',
        warning: `Please ensure you have the Unleash Slack app installed in your instance if you haven't installed it already, and to invite the app to any channel you want it to communicate in.`,
        title: 'Slack app installation',
        text: 'Clicking the Install button will send you to Slack to initiate the installation procedure for the Unleash Slack app for your instance',
    },
    parameters: [
        {
            name: 'accessToken',
            displayName: 'Access token',
            description: '(Required)',
            type: 'text',
            required: true,
            sensitive: true,
            position: 'top',
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
            name: 'slack-app',
            description:
                'Tag used by the Slack App addon to specify the Slack channel.',
            icon: 'S',
        },
    ],
};

export default slackAppDefinition;
