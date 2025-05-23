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
    CHANGE_REQUEST_CREATED,
    CHANGE_REQUEST_DISCARDED,
    CHANGE_ADDED,
    CHANGE_DISCARDED,
    CHANGE_REQUEST_APPROVED,
    CHANGE_REQUEST_APPROVAL_ADDED,
    CHANGE_REQUEST_CANCELLED,
    CHANGE_REQUEST_SENT_TO_REVIEW,
    CHANGE_REQUEST_APPLIED,
    FEATURE_POTENTIALLY_STALE_ON,
    CHANGE_REQUEST_SCHEDULED_APPLICATION_SUCCESS,
    CHANGE_REQUEST_SCHEDULED_APPLICATION_FAILURE,
    CHANGE_REQUEST_SCHEDULED,
    CHANGE_REQUEST_SCHEDULE_SUSPENDED,
    FEATURE_COMPLETED,
} from '../events/index.js';
import type { IAddonDefinition } from '../types/model.js';

const webhookDefinition: IAddonDefinition = {
    name: 'webhook',
    displayName: 'Webhook',
    description:
        'A Webhook is a generic way to post messages from Unleash to third party services.',
    documentationUrl: 'https://docs.getunleash.io/docs/addons/webhook',
    howTo: 'The Webhook Addon introduces a generic way to post messages from Unleash to third party services. Unleash allows you to define a webhook which listens for changes in Unleash and posts them to a third party services.',
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
            name: 'authorization',
            displayName: 'Authorization',
            placeholder: '',
            description:
                '(Optional) The Authorization header to use. Not used if left blank.',
            type: 'text',
            required: false,
            sensitive: true,
        },
        {
            name: 'customHeaders',
            displayName: 'Extra HTTP Headers',
            placeholder:
                '{\n"ISTIO_USER_KEY": "hunter2",\n"SOME_OTHER_CUSTOM_HTTP_HEADER": "SOMEVALUE"\n}',
            description: `(Optional) Used to add extra HTTP Headers to the request the plugin fires off. This must be a valid json object of key-value pairs where both the key and the value are strings`,
            required: false,
            sensitive: true,
            type: 'textfield',
        },
        {
            name: 'bodyTemplate',
            displayName: 'Body template',
            placeholder: `{
  "event": "{{event.type}}",
  "createdBy": "{{event.createdBy}}",
  "featureToggle": "{{event.data.name}}",
  "timestamp": "{{event.data.createdAt}}",
  "json": {{{eventJson}}}
}`,
            description:
                '(Optional) You may format the body using a mustache template. If you don\'t specify anything, the format will be similar to the [events format](https://docs.getunleash.io/reference/api/legacy/unleash/admin/events). You can use `{{{eventJson}}}` to include the entire serialized event, or `"{{eventMarkdown}}"` for the formatted description.',
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
        FEATURE_COMPLETED,
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
        CHANGE_REQUEST_CREATED,
        CHANGE_REQUEST_DISCARDED,
        CHANGE_ADDED,
        CHANGE_DISCARDED,
        CHANGE_REQUEST_APPROVED,
        CHANGE_REQUEST_APPROVAL_ADDED,
        CHANGE_REQUEST_CANCELLED,
        CHANGE_REQUEST_SENT_TO_REVIEW,
        CHANGE_REQUEST_APPLIED,
        CHANGE_REQUEST_SCHEDULED,
        CHANGE_REQUEST_SCHEDULED_APPLICATION_SUCCESS,
        CHANGE_REQUEST_SCHEDULED_APPLICATION_FAILURE,
        CHANGE_REQUEST_SCHEDULE_SUSPENDED,
        FEATURE_POTENTIALLY_STALE_ON,
    ],
};

export default webhookDefinition;
