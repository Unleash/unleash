import {
    FEATURE_ARCHIVED,
    FEATURE_CREATED,
    FEATURE_ENVIRONMENT_DISABLED,
    FEATURE_ENVIRONMENT_ENABLED,
    FEATURE_ENVIRONMENT_VARIANTS_UPDATED,
    FEATURE_METADATA_UPDATED,
    FEATURE_POTENTIALLY_STALE_ON,
    FEATURE_PROJECT_CHANGE,
    FEATURE_REVIVED,
    FEATURE_STALE_OFF,
    FEATURE_STALE_ON,
    FEATURE_STRATEGY_ADD,
    FEATURE_STRATEGY_REMOVE,
    FEATURE_STRATEGY_UPDATE,
    FEATURE_UPDATED,
} from '../events/index.js';
import type { IAddonDefinition } from '../types/model.js';

const newRelicDefinition: IAddonDefinition = {
    name: 'new-relic',
    displayName: 'New Relic',
    description: 'Allows Unleash to post updates to New Relic Event API.',
    documentationUrl: 'https://docs.getunleash.io/concepts/integrations',
    howTo: 'The New Relic integration allows Unleash to post Updates to New Relic Event API when a feature flag is updated.',
    parameters: [
        {
            name: 'url',
            displayName: 'New Relic Event URL',
            description:
                '(Required) If data is hosted in EU then use the EU region endpoints (https://docs.newrelic.com/docs/using-new-relic/welcome-new-relic/getting-started/introduction-eu-region-data-center/#endpoints). Otherwise, it should be something like this: https://insights-collector.newrelic.com/v1/accounts/YOUR_ACCOUNT_ID/events',
            type: 'url',
            required: true,
            sensitive: false,
        },
        {
            name: 'licenseKey',
            displayName: 'New Relic License Key',
            placeholder: 'eu01xx0f12a6b3434a8d710110bd862',
            description: '(Required) License key to connect to New Relic',
            type: 'text',
            required: true,
            sensitive: true,
        },
        {
            name: 'customHeaders',
            displayName: 'Extra HTTP Headers',
            placeholder: `{
  "SOME_CUSTOM_HTTP_HEADER": "SOME_VALUE",
  "SOME_OTHER_CUSTOM_HTTP_HEADER": "SOME_OTHER_VALUE"
}`,
            description:
                '(Optional) Used to add extra HTTP Headers to the request the plugin fires off. This must be a valid json object of key-value pairs where both the key and the value are strings',
            required: false,
            sensitive: true,
            type: 'textfield',
        },
        {
            name: 'bodyTemplate',
            displayName: 'Body template',
            placeholder: `{
  "event": "{{event.type}}",
  "eventType": "unleash",
  "createdBy": "{{event.createdBy}}",
  "featureToggle": "{{event.data.name}}",
  "timestamp": "{{event.data.createdAt}}"
}`,
            description:
                '(Optional) The default format is a markdown string formatted by Unleash. You may override the format of the body using a mustache template.',
            required: false,
            sensitive: false,
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
        FEATURE_PROJECT_CHANGE,
        FEATURE_ENVIRONMENT_VARIANTS_UPDATED,
        FEATURE_POTENTIALLY_STALE_ON,
    ],
    tagTypes: [
        {
            name: 'new-relic',
            description:
                'All New Relic tags added to a specific feature are sent to New Relic Event API.',
            icon: 'D',
        },
    ],
};

export default newRelicDefinition;
