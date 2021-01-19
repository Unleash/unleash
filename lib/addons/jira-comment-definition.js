const {
    FEATURE_CREATED,
    FEATURE_UPDATED,
    FEATURE_ARCHIVED,
    FEATURE_REVIVED,
} = require('../event-type');

module.exports = {
    name: 'jira-comment',
    displayName: 'Jira Commenter',
    description: 'Allows Unleash to post comments to JIRA issues',
    parameters: [
        {
            name: 'baseUrl',
            displayName: 'Jira base url e.g. https://myjira.atlassian.net',
            type: 'url',
            required: true,
        },
        {
            name: 'apiKey',
            displayName: 'Jira API token',
            description:
                'Used to authenticate against JIRA REST api, needs to be for a user with comment access to issues. ' +
                'Add a new key at https://id.atlassian.com/manage-profile/security/api-tokens when logged in as the user you want Unleash to use',
            type: 'text',
            required: true,
        },
        {
            name: 'user',
            displayName: 'JIRA username',
            description:
                'Used together with API key to authenticate against JIRA. Since Unleash adds comments as this user, it is a good idea to create a separate user',
            type: 'text',
            required: true,
        },
    ],
    events: [
        FEATURE_CREATED,
        FEATURE_UPDATED,
        FEATURE_ARCHIVED,
        FEATURE_REVIVED,
    ],
    tagTypes: [
        {
            name: 'jira',
            description:
                'Jira tag used by the jira addon to specify the JIRA issue to comment on',
            icon: 'J',
        },
    ],
};
