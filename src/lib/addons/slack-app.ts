import {
    WebClient,
    ConversationsListResponse,
    ErrorCode,
    WebClientEvent,
    CodedError,
    WebAPIPlatformError,
    WebAPIRequestError,
    WebAPIRateLimitedError,
    WebAPIHTTPError,
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

const CACHE_SECONDS = 30;

interface ISlackAppAddonParameters {
    accessToken: string;
    defaultChannels: string;
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
            const { accessToken, defaultChannels } = parameters;
            if (!accessToken) {
                this.logger.warn('No access token provided.');
                return;
            }

            const taggedChannels = this.findTaggedChannels(event);
            const eventChannels = taggedChannels.length
                ? taggedChannels
                : this.getDefaultChannels(defaultChannels);

            if (!eventChannels.length) {
                this.logger.debug(
                    `No Slack channels found for event ${event.type}.`,
                );
                return;
            }
            this.logger.debug(`Found candidate channels: ${eventChannels}.`);

            if (!this.slackClient || this.accessToken !== accessToken) {
                const client = new WebClient(accessToken);
                client.on(WebClientEvent.RATE_LIMITED, (numSeconds) => {
                    this.logger.debug(
                        `Rate limit reached for event ${event.type}. Retry scheduled after ${numSeconds} seconds`,
                    );
                });
                this.slackClient = client;
                this.accessToken = accessToken;
            }

            if (!this.slackChannels) {
                const slackConversationsList =
                    await this.slackClient.conversations.list({
                        types: 'public_channel,private_channel',
                        exclude_archived: true,
                        limit: 200,
                    });
                this.slackChannels = slackConversationsList.channels || [];
                let nextCursor =
                    slackConversationsList.response_metadata?.next_cursor;
                while (nextCursor !== undefined && nextCursor !== '') {
                    this.logger.debug('Fetching next page of channels');
                    const moreChannels =
                        await this.slackClient.conversations.list({
                            cursor: nextCursor,
                            types: 'public_channel,private_channel',
                            exclude_archived: true,
                            limit: 200,
                        });
                    const channels = moreChannels.channels;
                    if (channels === undefined) {
                        this.logger.debug(
                            'Channels list was empty, breaking pagination',
                        );
                        nextCursor = undefined;
                        break;
                    }
                    nextCursor = moreChannels.response_metadata?.next_cursor;
                    this.logger.debug(
                        `This page had ${channels.length} channels`,
                    );

                    channels.forEach((channel) =>
                        this.slackChannels?.push(channel),
                    );
                }

                this.logger.debug(
                    `Fetched ${
                        this.slackChannels.length
                    } available Slack channels: ${this.slackChannels.map(
                        ({ name }) => name,
                    )}`,
                );
            }

            const currentSlackChannels = [...this.slackChannels];
            if (!currentSlackChannels.length) {
                this.logger.warn('No available Slack channels found.');
                return;
            }

            const text = this.msgFormatter.format(event);
            const url = this.msgFormatter.featureLink(event);

            const slackChannelsToPostTo = currentSlackChannels.filter(
                ({ id, name }) => id && name && eventChannels.includes(name),
            );

            if (!slackChannelsToPostTo.length) {
                this.logger.info('No eligible Slack channel found.');
                return;
            }
            this.logger.debug(
                `Posting event to ${slackChannelsToPostTo.map(
                    ({ name }) => name,
                )}.`,
            );

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
                                    url,
                                },
                            ],
                        },
                    ],
                }),
            );

            const results = await Promise.allSettled(requests);

            results
                .filter(({ status }) => status === 'rejected')
                .map(({ reason }: PromiseRejectedResult) =>
                    this.logError(event, reason),
                );

            this.logger.info(
                `Handled event ${event.type} dispatching ${
                    results.filter(({ status }) => status === 'fulfilled')
                        .length
                } out of ${requests.length} messages successfully.`,
            );
        } catch (error) {
            this.logError(event, error);
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

    getDefaultChannels(defaultChannels?: string): string[] {
        if (defaultChannels) {
            return defaultChannels.split(',').map((c) => c.trim());
        }
        return [];
    }

    startCacheInvalidation(): void {
        this.slackChannelsCacheTimeout = setInterval(() => {
            this.slackChannels = undefined;
        }, CACHE_SECONDS * 1000);
    }

    logError(event: IEvent, error: Error | CodedError): void {
        if (!('code' in error)) {
            this.logger.warn(`Error handling event ${event.type}.`, error);
            return;
        }

        if (error.code === ErrorCode.PlatformError) {
            const { data } = error as WebAPIPlatformError;
            this.logger.warn(
                `Error handling event ${event.type}. A platform error occurred: ${data}`,
                error,
            );
        } else if (error.code === ErrorCode.RequestError) {
            const { original } = error as WebAPIRequestError;
            this.logger.warn(
                `Error handling event ${event.type}. A request error occurred: ${original}`,
                error,
            );
        } else if (error.code === ErrorCode.RateLimitedError) {
            const { retryAfter } = error as WebAPIRateLimitedError;
            this.logger.warn(
                `Error handling event ${event.type}. A rate limit error occurred: retry after ${retryAfter} seconds`,
                error,
            );
        } else if (error.code === ErrorCode.HTTPError) {
            const { statusCode } = error as WebAPIHTTPError;
            this.logger.warn(
                `Error handling event ${event.type}. An HTTP error occurred: status code ${statusCode}`,
                error,
            );
        } else {
            this.logger.warn(`Error handling event ${event.type}.`, error);
        }
    }

    destroy(): void {
        if (this.slackChannelsCacheTimeout) {
            clearInterval(this.slackChannelsCacheTimeout);
            this.slackChannelsCacheTimeout = undefined;
        }
    }
}

module.exports = SlackAppAddon;
