'use strict';

const YAML = require('js-yaml');
const Addon = require('./addon');

const {
    FEATURE_CREATED,
    FEATURE_UPDATED,
    FEATURE_ARCHIVED,
    FEATURE_REVIVED,
    FEATURE_STALE_ON,
    FEATURE_STALE_OFF,
} = require('../event-type');

const definition = require('./teams-definition');

class TeamsAddon extends Addon {
    constructor(args) {
        super(definition, args);
        this.unleashUrl = args.unleashUrl;
    }

    async handleEvent(event, parameters) {
        const { url } = parameters;
        const { createdBy, data, type } = event;
        let text = '';
        if ([FEATURE_ARCHIVED, FEATURE_REVIVED].includes(event.type)) {
            text = this.generateArchivedText(event);
        } else if ([FEATURE_STALE_ON, FEATURE_STALE_OFF].includes(event.type)) {
            text = this.generateStaleText(event);
        } else {
            text = this.generateText(event);
        }

        const enabled = `*${data.enabled ? 'yes' : 'no'}*`;
        const stale = data.stale ? '("stale")' : '';
        const body = {
            themeColor: '0076D7',
            summary: 'Message',
            sections: [
                {
                    activityTitle: text,
                    activitySubtitle: 'Unleash notification update',
                    facts: [
                        {
                            name: 'User',
                            value: createdBy,
                        },
                        {
                            name: 'Action',
                            value: this.getAction(type),
                        },
                        {
                            name: 'Enabled',
                            value: `${enabled}${stale}`,
                        },
                    ],
                },
            ],
            potentialAction: [
                {
                    '@type': 'OpenUri',
                    name: 'Go to feature',
                    targets: [
                        {
                            os: 'default',
                            uri: this.featureLink(event),
                        },
                    ],
                },
            ],
        };

        const requestOpts = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };
        const result = await this.fetchRetry(url, requestOpts);
        this.logger.info(`Handled event ${event.type}. Status codes=${result}`);
    }

    featureLink(event) {
        const path = event.type === FEATURE_ARCHIVED ? 'archive' : 'features';
        return `${this.unleashUrl}/#/${path}/strategies/${event.data.name}`;
    }

    generateStaleText(event) {
        const { data, type } = event;
        const isStale = type === FEATURE_STALE_ON;
        if (isStale) {
            return `The feature toggle *${data.name}* is now *ready to be removed* from the code.`;
        }
        return `The feature toggle *${data.name}* was *unmarked* as stale`;
    }

    generateArchivedText(event) {
        const { data, type } = event;
        const action = type === FEATURE_ARCHIVED ? 'archived' : 'revived';
        return `The feature toggle *${data.name}* was *${action}*`;
    }

    generateText(event) {
        const { data } = event;
        const typeStr = `*Type*: ${data.type}`;
        const project = `*Project*: ${data.project}`;
        const strategies = `*Activation strategies*: \n${YAML.safeDump(
            data.strategies,
            { skipInvalid: true },
        )}`;
        return `Feature toggle ${data.name} | ${typeStr} | ${project} <br /> ${strategies}`;
    }

    getAction(type) {
        switch (type) {
            case FEATURE_CREATED:
                return 'Create';
            case FEATURE_UPDATED:
                return 'Update';
            default:
                return type;
        }
    }
}

module.exports = TeamsAddon;
