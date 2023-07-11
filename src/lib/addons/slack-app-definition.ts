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
    configureInstall:
        'https://slack.com/oauth/v2/authorize?scope=channels:read,groups:read,chat:write,chat:write.public&client_id=5551823334146.5564580941921&redirect_uri=https://unleash-local.nunogois.com/api/admin/addons/cb/slack',
    parameters: [
        {
            name: 'accessToken',
            displayName: 'Access Token',
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
            name: 'slack-app',
            description:
                'Tag used by the Slack App addon to specify the Slack channel.',
            icon: 'S',
        },
    ],
};

export default slackAppDefinition;
