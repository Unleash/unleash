import Addon from './addon';

import slackDefinition from './slack-definition';
import { IAddonConfig } from '../types/model';

import {
    FeatureEventFormatter,
    FeatureEventFormatterMd,
    LinkStyle,
} from './feature-event-formatter-md';
import { IEvent } from '../types/events';

export default class SlackAddon extends Addon {
    private msgFormatter: FeatureEventFormatter;

    constructor(args: IAddonConfig) {
        super(slackDefinition, args);
        this.msgFormatter = new FeatureEventFormatterMd(
            args.unleashUrl,
            LinkStyle.SLACK,
        );
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

        const text = this.msgFormatter.format(event);
        const featureLink = this.msgFormatter.featureLink(event);

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
                                url: featureLink,
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

    findSlackChannels({ tags }: Pick<IEvent, 'tags'>): string[] {
        if (tags) {
            return tags
                .filter((tag) => tag.type === 'slack')
                .map((t) => t.value);
        }
        return [];
    }
}

module.exports = SlackAddon;
