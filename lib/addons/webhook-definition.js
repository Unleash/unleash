const {
    FEATURE_CREATED,
    FEATURE_UPDATED,
    FEATURE_ARCHIVED,
    FEATURE_REVIVED,
} = require('../event-type');

module.exports = {
    name: 'webhook',
    displayName: 'Webhook',
    description:
        'A Webhook is a generic way to post messages from Unleash to third party services.',
    documentationUrl: 'https://unleash.github.io/docs/addons/webhook',
    parameters: [
        {
            name: 'url',
            displayName: 'Webhook URL',
            description:
                '(Required) Unleash will perform a HTTP Post to the specified URL (one retry if first attempt fails)',
            type: 'url',
            required: true,
        },
        {
            name: 'contentType',
            displayName: 'Content-Type',
            placeholder: 'application/json',
            description:
                '(Optional) The Content-Type header to use. Defaults to "application/json".',
            type: 'text',
            required: false,
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
                "(Optional) You may format the body using a mustache template. If you don't specify anything, the format will similar to the events format (https://unleash.github.io/docs/api/admin/events)",
            type: 'textfield',
            required: false,
        },
    ],
    events: [
        FEATURE_CREATED,
        FEATURE_UPDATED,
        FEATURE_ARCHIVED,
        FEATURE_REVIVED,
    ],
};
