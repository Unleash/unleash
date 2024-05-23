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
} from '../types/events';
import type { IAddonDefinition } from '../types/model';

const teamsDefinition: IAddonDefinition = {
    name: 'teams',
    displayName: 'Microsoft Teams',
    description: 'Allows Unleash to post updates to Microsoft Teams.',
    documentationUrl: 'https://docs.getunleash.io/docs/addons/teams',
    howTo: 'The Microsoft Teams integration allows Unleash to post Updates when a feature flag is updated.',
    parameters: [
        {
            name: 'url',
            displayName: 'Microsoft Teams webhook URL',
            description: '(Required)',
            type: 'url',
            required: true,
            sensitive: true,
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
    ],
};

export default teamsDefinition;
