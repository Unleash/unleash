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
} = require('../types/events');

const definition = require('./datadog-definition');

class DatadogAddon extends Addon {
    constructor(args) {
        super(definition, args);
        this.unleashUrl = args.unleashUrl;
    }

    async handleEvent(event, parameters) {
        const {
            url = 'https://api.datadoghq.com/api/v1/events',
            apiKey,
        } = parameters;
        let text;

        if ([FEATURE_ARCHIVED, FEATURE_REVIVED].includes(event.type)) {
            text = this.generateArchivedText(event);
        } else if ([FEATURE_STALE_ON, FEATURE_STALE_OFF].includes(event.type)) {
            text = this.generateStaleText(event);
        } else {
            text = this.generateText(event);
        }
        const body = {
            text: `%%% \n ${text} \n %%% `,
            title: 'Unleash notification update',
        };

        const requestOpts = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'DD-API-KEY': apiKey,
            },
            body: JSON.stringify(body),
        };
        const response = await this.fetchRetry(url, requestOpts);
        this.logger.info(
            `Handled event ${event.type}. Status codes=${JSON.stringify(
                response,
            )}`,
        );
    }

    featureLink(event) {
        const path = event.type === FEATURE_ARCHIVED ? 'archive' : 'features';
        return `${this.unleashUrl}/#/${path}/strategies/${event.data.name}`;
    }

    generateStaleText(event) {
        const { createdBy, data, type } = event;
        const isStale = type === FEATURE_STALE_ON;
        const feature = `[${data.name}](${this.featureLink(event)})`;

        if (isStale) {
            return `The feature toggle *${feature}* is now *ready to be removed* from the code. 
This was changed by ${createdBy}.`;
        }
        return `The feature toggle *${feature}* was *unmarked as stale* by ${createdBy}.`;
    }

    generateArchivedText(event) {
        const { createdBy, data, type } = event;
        const action = type === FEATURE_ARCHIVED ? 'archived' : 'revived';
        const feature = `[${data.name}](${this.featureLink(event)})`;
        return `The feature toggle *${feature}* was *${action}* by ${createdBy}.`;
    }

    generateText(event) {
        const { createdBy, data, type } = event;
        const action = this.getAction(type);
        const feature = `[${data.name}](${this.featureLink(event)})`;
        const enabled = `**Enabled**: ${data.enabled ? 'yes' : 'no'}`;
        const stale = data.stale ? '("stale")' : '';
        const typeStr = `**Type**: ${data.type}`;
        const project = `**Project**: ${data.project}`;
        const strategies = `**Activation strategies**: \`\`\`${YAML.safeDump(
            data.strategies,
            { skipInvalid: true },
        )}\`\`\``;
        return `${createdBy} ${action} feature toggle ${feature}
${enabled}${stale} | ${typeStr} | ${project}
${strategies}`;
    }

    getAction(type) {
        switch (type) {
            case FEATURE_CREATED:
                return 'created';
            case FEATURE_UPDATED:
                return 'updated';
            default:
                return type;
        }
    }
}

module.exports = DatadogAddon;
