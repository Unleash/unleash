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
    name: 'teams',
    displayName: 'Microsoft Teams',
    description: 'Allows Unleash to post updates to Microsoft Teams.',
    documentationUrl: 'https://docs.getunleash.io/docs/addons/teams',
    parameters: [
        {
            name: 'url',
            displayName: 'Microsoft Teams webhook URL',
            type: 'url',
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
    ],
};
