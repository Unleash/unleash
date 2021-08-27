import YAML from 'js-yaml';
import Addon from './addon';

import slackDefinition from './slack-definition';
import { IAddonConfig, IEvent } from '../types/model';

const {
    FEATURE_CREATED,
    FEATURE_UPDATED,
    FEATURE_ARCHIVED,
    FEATURE_REVIVED,
    FEATURE_STALE_ON,
    FEATURE_STALE_OFF,
} = require('../types/events');

export default class SlackAddon extends Addon {
    unleashUrl: string;

    constructor(args: IAddonConfig) {
        super(slackDefinition, args);
        this.unleashUrl = args.unleashUrl;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async handleEvent(event: IEvent, parameters: any): Promise<void> {
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

        let text;

        if ([FEATURE_ARCHIVED, FEATURE_REVIVED].includes(event.type)) {
            text = this.generateArchivedText(event);
        } else if ([FEATURE_STALE_ON, FEATURE_STALE_OFF].includes(event.type)) {
            text = this.generateStaleText(event);
        } else {
            text = this.generateText(event);
        }

        const requests = slackChannels.map((channel) => {
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
                                url: this.featureLink(event),
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
        const codes = results.map((res) => res.status).join(', ');
        this.logger.info(`Handled event ${event.type}. Status codes=${codes}`);
    }

    featureLink(event: IEvent): string {
        const path = event.type === FEATURE_ARCHIVED ? 'archive' : 'features';
        return `${this.unleashUrl}/${path}/strategies/${event.data.name}`;
    }

    findSlackChannels({ tags }: Pick<IEvent, 'tags'>): string[] {
        if (tags) {
            return tags
                .filter((tag) => tag.type === 'slack')
                .map((t) => t.value);
        }
        return [];
    }

    generateStaleText(event: IEvent): string {
        const { createdBy, data, type } = event;
        const isStale = type === FEATURE_STALE_ON;
        const feature = `<${this.featureLink(event)}|${data.name}>`;

        if (isStale) {
            return `The feature toggle *${feature}* is now *ready to be removed* from the code. :technologist:
This was changed by ${createdBy}.`;
        }
        return `The feature toggle *${feature}* was *unmarked as stale* by ${createdBy}.`;
    }

    generateArchivedText(event: IEvent): string {
        const { createdBy, data, type } = event;
        const action = type === FEATURE_ARCHIVED ? 'archived' : 'revived';
        const feature = `<${this.featureLink(event)}|${data.name}>`;
        return `The feature toggle *${feature}* was *${action}* by ${createdBy}.`;
    }

    generateText(event: IEvent): string {
        const { createdBy, data, type } = event;
        const action = this.getAction(type);
        const feature = `<${this.featureLink(event)}|${data.name}>`;
        const enabled = `*Enabled*: ${data.enabled ? 'yes' : 'no'}`;
        const stale = data.stale ? '("stale")' : '';
        const typeStr = `*Type*: ${data.type}`;
        const project = `*Project*: ${data.project}`;
        const strategies = `*Activation strategies*: \`\`\`${YAML.safeDump(
            data.strategies,
            { skipInvalid: true },
        )}\`\`\``;
        return `${createdBy} ${action} feature toggle ${feature}
${enabled}${stale} | ${typeStr} | ${project}
${data.strategies ? strategies : ''}`;
    }

    getAction(type: string): string {
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

module.exports = SlackAddon;
