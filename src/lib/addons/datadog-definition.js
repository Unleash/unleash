'use strict';

const {
    FEATURE_CREATED,
    FEATURE_UPDATED,
    FEATURE_ARCHIVED,
    FEATURE_REVIVED,
    FEATURE_STALE_ON,
    FEATURE_STALE_OFF,
} = require('../types/events');

module.exports = {
    name: 'datadog',
    displayName: 'Data dog',
    description: 'Allows Unleash to post updates to Data dog.',
    documentationUrl: 'https://docs.getunleash.io/docs/addons/datadog',
    parameters: [
        {
            name: 'url',
            displayName: 'Data dog webhook URL',
            type: 'url',
            required: true,
            sensitive: true,
        },
        {
            name: 'apiKey',
            displayName: 'DD API KEY',
            placeholder: 'j96c23b0f12a6b3434a8d710110bd862',
            description: 'Api key from datadog',
            type: 'text',
            required: false,
        },
    ],
    events: [
        FEATURE_CREATED,
        FEATURE_UPDATED,
        FEATURE_ARCHIVED,
        FEATURE_REVIVED,
        FEATURE_STALE_ON,
        FEATURE_STALE_OFF,
    ],
};
