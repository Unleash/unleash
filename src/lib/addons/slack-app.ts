import {
    WebClient,
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
import { IAddonConfig, ITag } from '../types/model';
import {
    FeatureEventFormatter,
    FeatureEventFormatterMd,
    LinkStyle,
} from './feature-event-formatter-md';
import { IEvent } from '../types/events';
import { IFeatureTagStore } from '../types';

interface ISlackAppAddonParameters {
    accessToken: string;
    defaultChannels: string;
    alwaysPostToDefault: string;
}

interface ISlackAppAddonConfig extends IAddonConfig {
    featureTagStore: IFeatureTagStore;
}

export default class SlackAppAddon extends Addon {
    private msgFormatter: FeatureEventFormatter;

    private accessToken?: string;

    private slackClient?: WebClient;

    private featureTagStore: IFeatureTagStore;

    constructor(args: ISlackAppAddonConfig) {
        super(slackAppDefinition, args);
        this.msgFormatter = new FeatureEventFormatterMd(
            args.unleashUrl,
            LinkStyle.SLACK,
        );
        this.featureTagStore = args.featureTagStore;
    }

    async handleEvent(
        event: IEvent,
        parameters: ISlackAppAddonParameters,
    ): Promise<void> {
        try {
            const { accessToken, defaultChannels, alwaysPostToDefault } =
                parameters;
            if (!accessToken) {
                this.logger.warn('No access token provided.');
                return;
            }

            const postToDefault =
                alwaysPostToDefault === 'true' || alwaysPostToDefault === 'yes';
            this.logger.debug(`Post to default was set to ${postToDefault}`);

            const taggedChannels = await this.findTaggedSlackChannels(event);

            let eventChannels: string[];
            if (postToDefault) {
                eventChannels = taggedChannels.concat(
                    this.getDefaultChannels(defaultChannels),
                );
            } else {
                eventChannels = taggedChannels.length
                    ? taggedChannels
                    : this.getDefaultChannels(defaultChannels);
            }

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

            const text = this.msgFormatter.format(event);
            const url = this.msgFormatter.featureLink(event);
            const requests = eventChannels.map((name) => {
                return this.slackClient!.chat.postMessage({
                    channel: name,
                    text,
                    blocks: [
                        {
                            type: 'section',
                            text: {
                                type: 'mrkdwn',
                                text,
                            },
                        },
                        {
                            type: 'actions',
                            elements: [
                                {
                                    type: 'button',
                                    url,
                                    text: {
                                        type: 'plain_text',
                                        text: 'Open in Unleash',
                                    },
                                    value: 'featureToggle',
                                    style: 'primary',
                                },
                            ],
                        },
                    ],
                });
            });

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

    getDefaultChannels(defaultChannels?: string): string[] {
        if (defaultChannels) {
            return defaultChannels.split(',').map((c) => c.trim());
        }
        return [];
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
}

module.exports = SlackAppAddon;
