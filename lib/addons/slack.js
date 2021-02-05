'use strict';

const YAML = require('js-yaml');
const Addon = require('./addon');

const {
    FEATURE_CREATED,
    FEATURE_UPDATED,
    FEATURE_ARCHIVED,
    FEATURE_REVIVED,
} = require('../event-type');

const definition = require('./slack-definition');

class SlackAddon extends Addon {
    constructor(args) {
        super(definition, args);
        this.unleashUrl = args.unleashUrl;
    }

    async handleEvent(event, parameters) {
        const {
            url,
            defaultChannel,
            username = 'Unleash',
            iconEmoji = ':unleash:',
        } = parameters;

        const slackChannels = this.findSlackChannels(event);

        if (slackChannels.length === 0) {
            slackChannels.push(defaultChannel);
        }

        const text = this.generateText(event);

        const requests = slackChannels.map(channel => {
            const body = {
                username,
                icon_emoji: iconEmoji, // eslint-disable-line camelcase
                text,
                channel: `#${channel}`,
                attachments: [
                    {
                        actions: [
                            {
                                name: 'featureToggle',
                                text: 'Open in Unleash',
                                type: 'button',
                                value: 'featureToggle',
                                style: 'primary',
                                url: `${this.unleashUrl}/#/features/strategies/${event.data.name}`,
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

            return this.fetchRetry(url, requestOpts);
        });

        const results = await Promise.all(requests);
        const codes = results.map(res => res.status).join(', ');
        this.logger.info(`Handled event ${event.type}. Status codes=${codes}`);
    }

    findSlackChannels({ tags = [] }) {
        return tags.filter(tag => tag.type === 'slack').map(t => t.value);
    }

    generateText({ createdBy, data, type }) {
        const eventName = this.eventName(type);
        const feature = `<${this.unleashUrl}/#/features/strategies/${data.name}|${data.name}>`;
        const enabled = `*Enabled*: ${data.enabled ? 'yes' : 'no'}`;
        const stale = data.stale ? '("stale")' : '';
        const typeStr = `*Type*: ${data.type}`;
        const project = `*Project*: ${data.project}`;
        const strategies = `*Activation strategies*: \`\`\`${YAML.safeDump(
            data.strategies,
            { skipInvalid: true },
        )}\`\`\``;
        return `${createdBy} ${eventName} ${feature}
${enabled}${stale} | ${typeStr} | ${project}
${strategies}`;
    }

    eventName(type) {
        switch (type) {
            case FEATURE_CREATED:
                return 'created feature toggle';
            case FEATURE_UPDATED:
                return 'updated feature toggle';
            case FEATURE_ARCHIVED:
                return 'archived feature toggle';
            case FEATURE_REVIVED:
                return 'revive feature toggle';
            default:
                return type;
        }
    }
}

module.exports = SlackAddon;
