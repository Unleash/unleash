import Addon from './addon';

import slackDefinition from './slack-definition';
import { IAddonConfig, ITag } from '../types/model';

import {
    FeatureEventFormatter,
    FeatureEventFormatterMd,
    LinkStyle,
} from './feature-event-formatter-md';
import { IEvent } from '../types/events';
import { IFeatureTagStore } from '../types';

interface ISlackAddonParameters {
    url: string;
    username?: string;
    defaultChannel: string;
    emojiIcon?: string;
    customHeaders?: string;
}

interface ISlackAddonConfig extends IAddonConfig {
    featureTagStore: IFeatureTagStore;
}

export default class SlackAddon extends Addon {
    private msgFormatter: FeatureEventFormatter;

    private featureTagStore: IFeatureTagStore;

    constructor(args: ISlackAddonConfig) {
        super(slackDefinition, args);
        this.msgFormatter = new FeatureEventFormatterMd(
            args.unleashUrl,
            LinkStyle.SLACK,
        );
        this.featureTagStore = args.featureTagStore;
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

        const slackChannels = await this.findTaggedSlackChannels(event);

        if (slackChannels.length === 0) {
            slackChannels.push(defaultChannel);
        }

        const text = this.msgFormatter.format(event);
        const featureLink = this.msgFormatter.featureLink(event);

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

    async getFeatureTags(featureName?: string): Promise<ITag[]> {
        if (featureName) {
            return this.featureTagStore.getAllTagsForFeature(featureName);
        }
        return [];
    }

    async findTaggedSlackChannels({
        featureName,
    }: Pick<IEvent, 'featureName'>): Promise<string[]> {
        const tags = await this.getFeatureTags(featureName);
        if (tags.length) {
            return tags
                .filter((tag) => tag.type === 'slack')
                .map((t) => t.value);
        }
        return [];
    }
}

module.exports = SlackAddon;
