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

const dataDogDefinition: IAddonDefinition = {
    name: 'datadog',
    displayName: 'Datadog',
    description: 'Allows Unleash to post updates to Datadog.',
    documentationUrl: 'https://docs.getunleash.io/docs/addons/datadog',
    parameters: [
        {
            name: 'url',
            displayName: 'Datadog Events URL',
            description:
                'Default url: https://api.datadoghq.com/api/v1/events. Needs to be changed if your not using the US1 site.',
            type: 'url',
            required: false,
            sensitive: false,
        },
        {
            name: 'apiKey',
            displayName: 'Datadog API key',
            placeholder: 'j96c23b0f12a6b3434a8d710110bd862',
            description: '(Required) API key from Datadog',
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
        FEATURE_PROJECT_CHANGE,
        FEATURE_VARIANTS_UPDATED,
    ],
    tagTypes: [
        {
            name: 'datadog',
            description:
                'All Datadog tags added to a specific feature are sent to datadog event stream.',
            icon: 'D',
        },
    ],
};

export default dataDogDefinition;
