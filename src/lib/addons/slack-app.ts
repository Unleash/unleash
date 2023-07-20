import {
    WebClient,
    ConversationsListResponse,
    ErrorCode,
} from '@slack/web-api';
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

    private accessToken?: string;

    private slackClient?: WebClient;

    private slackChannels?: ConversationsListResponse['channels'];

    private slackChannelsCacheTimeout?: NodeJS.Timeout;

    constructor(args: IAddonConfig) {
        super(slackAppDefinition, args);
        this.msgFormatter = new FeatureEventFormatterMd(
            args.unleashUrl,
            LinkStyle.SLACK,
        );
        this.startCacheInvalidation();
    }

    async handleEvent(
        event: IEvent,
        parameters: ISlackAppAddonParameters,
    ): Promise<void> {
        try {
            const { accessToken } = parameters;

            if (!accessToken) return;

            if (!this.slackClient || this.accessToken !== accessToken) {
                this.slackClient = new WebClient(accessToken);
                this.accessToken = accessToken;
            }

            if (!this.slackChannels) {
                const slackConversationsList =
                    await this.slackClient.conversations.list({
                        types: 'public_channel,private_channel',
                    });
                this.slackChannels = slackConversationsList.channels || [];
                this.logger.debug(
                    `Fetched ${this.slackChannels.length} Slack channels`,
                );
            }

            const taggedChannels = this.findTaggedChannels(event);

            if (this.slackChannels?.length && taggedChannels.length) {
                const slackChannelsToPostTo = this.slackChannels.filter(
                    ({ id, name }) =>
                        id && name && taggedChannels.includes(name),
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
                this.logger.info(
                    `Handled event ${event.type} dispatching ${requests.length} messages`,
                );
            }
        } catch (error) {
            if (error.code === ErrorCode.PlatformError) {
                this.logger.error(
                    `Error handling event ${event.type}. A platform error occurred: ${error.data}`,
                    error,
                );
            } else if (error.code === ErrorCode.RequestError) {
                this.logger.error(
                    `Error handling event ${event.type}. A request error occurred: ${error.original}`,
                    error,
                );
            } else if (error.code === ErrorCode.RateLimitedError) {
                this.logger.error(
                    `Error handling event ${event.type}. A rate limit error occurred: retry after ${error.retryAfter} seconds`,
                    error,
                );
            } else if (error.code === ErrorCode.HTTPError) {
                this.logger.error(
                    `Error handling event ${event.type}. An HTTP error occurred: status code ${error.statusCode}`,
                    error,
                );
            } else {
                this.logger.error(`Error handling event ${event.type}.`, error);
            }
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

    startCacheInvalidation(): void {
        this.slackChannelsCacheTimeout = setInterval(() => {
            this.slackChannels = undefined;
        }, 30000);
    }

    destroy(): void {
        if (this.slackChannelsCacheTimeout) {
            clearInterval(this.slackChannelsCacheTimeout);
            this.slackChannelsCacheTimeout = undefined;
        }
    }
}

module.exports = SlackAppAddon;
