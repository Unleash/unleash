import Addon from './addon';

import slackDefinition from './slack-definition';
import { IAddonConfig } from '../types/model';

import {
    FeatureEventFormatter,
    FeatureEventFormatterMd,
    LinkStyle,
} from './feature-event-formatter-md';
import { IEvent } from '../types/events';

interface ISlackAddonParameters {
    url: string;
    username?: string;
    defaultChannel: string;
    emojiIcon?: string;
    customHeaders?: string;
}
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
    async handleEvent(
        event: IEvent,
        parameters: ISlackAddonParameters,
    ): Promise<void> {
        const {
            url,
            defaultChannel,
            username = 'Unleash',
            emojiIcon = ':unleash:',
            customHeaders,
        } = parameters;

        const slackChannels = this.findSlackChannels(event);

        if (slackChannels.length === 0) {
            slackChannels.push(defaultChannel);
        }

        const { text, url: featureLink } = this.msgFormatter.format(event);

        const requests = slackChannels.map((channel) => {
            const body = {
                username,
                icon_emoji: emojiIcon, // eslint-disable-line camelcase
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
            let extraHeaders = {};
            if (typeof customHeaders === 'string' && customHeaders.length > 1) {
                try {
                    extraHeaders = JSON.parse(customHeaders);
                } catch (e) {
                    this.logger.warn(
                        `Could not parse the json in the customHeaders parameter. [${customHeaders}]`,
                    );
                }
            }
            const requestOpts = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...extraHeaders,
                },
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
