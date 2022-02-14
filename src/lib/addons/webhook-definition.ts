import {
    FEATURE_ARCHIVED,
    FEATURE_CREATED,
    FEATURE_ENVIRONMENT_DISABLED,
    FEATURE_ENVIRONMENT_ENABLED,
    FEATURE_METADATA_UPDATED,
    FEATURE_VARIANTS_UPDATED,
    FEATURE_PROJECT_CHANGE,
    FEATURE_REVIVED,
    FEATURE_STALE_OFF,
    FEATURE_STALE_ON,
    FEATURE_STRATEGY_ADD,
    FEATURE_STRATEGY_REMOVE,
    FEATURE_STRATEGY_UPDATE,
    FEATURE_UPDATED,
    FEATURE_TAGGED,
    FEATURE_UNTAGGED,
} from '../types/events';
import { IAddonDefinition } from '../types/model';

const webhookDefinition: IAddonDefinition = {
    name: 'webhook',
    displayName: 'Webhook',
    description:
        'A Webhook is a generic way to post messages from Unleash to third party services.',
    documentationUrl: 'https://docs.getunleash.io/docs/addons/webhook',
    parameters: [
        {
            name: 'url',
            displayName: 'Webhook URL',
            description:
                '(Required) Unleash will perform a HTTP Post to the specified URL (one retry if first attempt fails)',
            type: 'url',
            required: true,
            sensitive: true,
        },
        {
            name: 'contentType',
            displayName: 'Content-Type',
            placeholder: 'application/json',
            description:
                '(Optional) The Content-Type header to use. Defaults to "application/json".',
            type: 'text',
            required: false,
            sensitive: false,
        },
        {
            name: 'bodyTemplate',
            displayName: 'Body template',
            placeholder: `{
  "event": "{{event.type}}",
  "createdBy": "{{event.createdBy}}",
  "featureToggle": "{{event.data.name}}",
  "timestamp": "{{event.data.createdAt}}"
}`,
            description:
                "(Optional) You may format the body using a mustache template. If you don't specify anything, the format will similar to the events format (https://docs.getunleash.io/docs/api/admin/events)",
            type: 'textfield',
            required: false,
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
        FEATURE_TAGGED,
        FEATURE_UNTAGGED,
    ],
};

export default webhookDefinition;
