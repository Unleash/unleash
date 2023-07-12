import { WebClient } from '@slack/web-api';
import Addon from './addon';

import slackAppDefinition from './slack-app-definition';
import { IAddonConfig } from '../types/model';

import {
    FeatureEventFormatter,
    FeatureEventFormatterMd,
    LinkStyle,
} from './feature-event-formatter-md';
import { IEvent } from '../types/events';

interface ISlackAppAddonParameters {
    accessToken: string;
}
export default class SlackAppAddon extends Addon {
    private msgFormatter: FeatureEventFormatter;

    private slackClient?: WebClient;

    constructor(args: IAddonConfig) {
        super(slackAppDefinition, args);
        this.msgFormatter = new FeatureEventFormatterMd(
            args.unleashUrl,
            LinkStyle.SLACK,
        );
    }

    async handleEvent(
        event: IEvent,
        parameters: ISlackAppAddonParameters,
    ): Promise<void> {
        const { accessToken } = parameters;

        if (!accessToken) return;

        if (!this.slackClient) {
            this.slackClient = new WebClient(accessToken);
        }

        const slackChannels = await this.slackClient.conversations.list({
            types: 'public_channel,private_channel',
        });
        const taggedChannels = this.findTaggedChannels(event);

        if (slackChannels.channels?.length && taggedChannels.length) {
            const slackChannelsToPostTo = slackChannels.channels.filter(
                ({ id, name }) => id && name && taggedChannels.includes(name),
            );

            const text = this.msgFormatter.format(event);
            const featureLink = this.msgFormatter.featureLink(event);

            const requests = slackChannelsToPostTo.map(({ id }) =>
                this.slackClient!.chat.postMessage({
                    channel: id!,
                    text,
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
                }),
            );

            await Promise.all(requests);
            this.logger.info(`Handled event ${event.type}.`);
        }
    }

    findTaggedChannels({ tags }: Pick<IEvent, 'tags'>): string[] {
        if (tags) {
            return tags
                .filter((tag) => tag.type === 'slack')
                .map((t) => t.value);
        }
        return [];
    }
}

module.exports = SlackAppAddon;
