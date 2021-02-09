'use strict';

const Addon = require('./addon');
const definition = require('./jira-comment-definition');
const {
    FEATURE_CREATED,
    FEATURE_UPDATED,
    FEATURE_REVIVED,
    FEATURE_ARCHIVED,
} = require('../event-type');

class JiraAddon extends Addon {
    constructor(args) {
        super(definition, args);
        this.unleashUrl = args.unleashUrl;
    }

    async handleEvent(event, parameters) {
        const { type: eventName } = event;
        const { baseUrl, user, apiKey } = parameters;
        const issuesToPostTo = this.findJiraTag(event);
        const action = this.getAction(eventName);

        const body = this.formatBody(event, action);

        const requests = issuesToPostTo.map(async issueTag => {
            const issue = issueTag.value;
            const issueUrl = `${baseUrl}/rest/api/3/issue/${issue}/comment`;

            const requestOpts = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: this.buildAuthHeader(user, apiKey),
                },
                body,
            };

            return this.fetchRetry(issueUrl, requestOpts);
        });

        const results = await Promise.all(requests);
        const codes = results.map(res => res.status).join(', ');
        this.logger.info(`Handled event ${event.type}. Status codes=${codes}`);
    }

    getAction(eventName) {
        switch (eventName) {
            case FEATURE_CREATED:
                return 'created';
            case FEATURE_UPDATED:
                return 'updated';
            case FEATURE_ARCHIVED:
                return 'archived';
            case FEATURE_REVIVED:
                return 'revived';
            default:
                return 'unknown';
        }
    }

    encode(str) {
        return Buffer.from(str, 'utf-8').toString('base64');
    }

    formatBody(event, action) {
        const featureName = event.data.name;
        const { createdBy } = event;
        return JSON.stringify({
            body: {
                type: 'doc',
                version: 1,
                content: [
                    {
                        type: 'paragraph',
                        content: [
                            {
                                type: 'text',
                                text: `Feature toggle "${featureName}" was ${action} by ${createdBy}`,
                            },
                        ],
                    },
                    {
                        type: 'paragraph',
                        content: [
                            {
                                type: 'text',
                                text: `To see what happened visit Unleash`,
                                marks: [
                                    {
                                        type: 'link',
                                        attrs: {
                                            href: `${this.unleashUrl}/#/features/strategies/${featureName}`,
                                            title: 'Visit Unleash Admin UI',
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        });
    }

    buildAuthHeader(userName, apiKey) {
        const base64 = this.encode(`${userName}:${apiKey}`);
        return `Basic ${base64}`;
    }

    findJiraTag({ tags }) {
        return tags.filter(tag => tag.type === 'jira');
    }
}
module.exports = JiraAddon;
