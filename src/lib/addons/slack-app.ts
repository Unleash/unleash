import {
    WebClient,
    ErrorCode,
    WebClientEvent,
    type CodedError,
    type Methods as SlackSDK,
    type WebAPIPlatformError,
    type WebAPIRequestError,
    type WebAPIRateLimitedError,
    type WebAPIHTTPError,
    type KnownBlock,
    type Block,
} from '@slack/web-api';
import Addon from './addon.js';

import slackAppDefinition from './slack-app-definition.js';
import {
    type IAddonConfig,
    type IFlagResolver,
    serializeDates,
} from '../types/index.js';
import {
    type FeatureEventFormatter,
    FeatureEventFormatterMd,
    LinkStyle,
} from './feature-event-formatter-md.js';
import type { IEvent } from '../events/index.js';
import type { IntegrationEventState } from '../features/integration-events/integration-events-store.js';

interface ISlackAppAddonParameters {
    accessToken: string;
    defaultChannels: string;
}

export type SlackClientProvider = (accessToken: string) => SlackSDK;
const defaultClientProvider: SlackClientProvider = (accessToken: string) => {
    return new WebClient(accessToken);
};

export default class SlackAppAddon extends Addon {
    private msgFormatter: FeatureEventFormatter;

    declare flagResolver: IFlagResolver;

    private accessToken?: string;

    private slackClient?: SlackSDK;

    constructor(
        args: IAddonConfig,
        readonly clientProvider: SlackClientProvider = defaultClientProvider,
    ) {
        super(slackAppDefinition, args);
        this.msgFormatter = new FeatureEventFormatterMd({
            unleashUrl: args.unleashUrl,
            linkStyle: LinkStyle.SLACK,
        });
        this.flagResolver = args.flagResolver;
    }

    async handleEvent(
        event: IEvent,
        parameters: ISlackAppAddonParameters,
        integrationId: number,
    ): Promise<void> {
        let state: IntegrationEventState = 'success';
        const stateDetails: string[] = [];
        let channels: string[] = [];
        let message = '';

        try {
            const { accessToken, defaultChannels } = parameters;
            if (!accessToken) {
                const noAccessTokenMessage = 'No access token provided.';
                this.logger.warn(noAccessTokenMessage);
                this.registerEarlyFailureEvent(
                    integrationId,
                    event,
                    noAccessTokenMessage,
                );
                return;
            }

            const taggedChannels = this.findTaggedChannels(event);
            channels = this.getUniqueArray(
                taggedChannels.concat(this.getDefaultChannels(defaultChannels)),
            );

            if (!channels.length) {
                const noSlackChannelsMessage = `No Slack channels found for event ${event.type}.`;
                this.logger.debug(noSlackChannelsMessage);
                this.registerEarlyFailureEvent(
                    integrationId,
                    event,
                    noSlackChannelsMessage,
                );
                return;
            }

            this.logger.debug(
                `Found candidate channels: ${JSON.stringify(channels)}.`,
            );

            if (!this.slackClient || this.accessToken !== accessToken) {
                const client = this.clientProvider(accessToken);
                client.on(WebClientEvent.RATE_LIMITED, (numSeconds) => {
                    this.logger.debug(
                        `Rate limit reached for event ${event.type}. Retry scheduled after ${numSeconds} seconds`,
                    );
                });
                this.slackClient = client;
                this.accessToken = accessToken;
            }

            const { text: formattedMessage, url } =
                this.msgFormatter.format(event);
            const maxLength = 3000;
            const text = formattedMessage.substring(0, maxLength);
            message = `${formattedMessage}${text.length < formattedMessage.length ? ` (trimmed to ${maxLength} characters)` : ''}`;

            const blocks: (Block | KnownBlock)[] = [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text,
                    },
                },
            ];

            if (url) {
                blocks.push({
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
                });
            }

            const requests = channels.map((name) => {
                return this.slackClient!.chat.postMessage({
                    channel: name,
                    text,
                    blocks,
                    unfurl_links: false,
                });
            });

            const results = await Promise.allSettled(requests);

            const failedRequests = results.filter(
                ({ status }) => status === 'rejected',
            );
            const errors = this.getUniqueArray(
                failedRequests.map(({ reason }: PromiseRejectedResult) =>
                    this.parseError(reason),
                ),
            ).join(' ');

            if (failedRequests.length === 0) {
                const successMessage = `All (${results.length}) Slack client calls were successful.`;
                stateDetails.push(successMessage);
                this.logger.info(successMessage);
            } else if (failedRequests.length === results.length) {
                state = 'failed';
                const failedMessage = `All (${results.length}) Slack client calls failed with the following errors: ${errors}`;
                stateDetails.push(failedMessage);
                this.logger.warn(failedMessage);
            } else {
                state = 'successWithErrors';
                const successWithErrorsMessage = `Some (${failedRequests.length} of ${results.length}) Slack client calls failed. Errors: ${errors}`;
                stateDetails.push(successWithErrorsMessage);
                this.logger.warn(successWithErrorsMessage);
            }
        } catch (error) {
            state = 'failed';
            const eventErrorMessage = `Error handling event ${event.type}.`;
            stateDetails.push(eventErrorMessage);
            this.logger.warn(eventErrorMessage);
            const errorMessage = this.parseError(error);
            stateDetails.push(errorMessage);
            this.logger.warn(errorMessage, error);
        } finally {
            this.registerEvent({
                integrationId,
                state,
                stateDetails: stateDetails.join('\n'),
                event: serializeDates(event),
                details: {
                    channels,
                    message,
                },
            });
        }
    }

    getUniqueArray<T>(arr: T[]): T[] {
        return [...new Set(arr)];
    }

    registerEarlyFailureEvent(
        integrationId: number,
        event: IEvent,
        earlyFailureMessage: string,
    ): void {
        this.registerEvent({
            integrationId,
            state: 'failed',
            stateDetails: earlyFailureMessage,
            event: serializeDates(event),
            details: {
                channels: [],
                message: '',
            },
        });
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

    parseError(error: Error | CodedError): string {
        if ('code' in error) {
            if (error.code === ErrorCode.PlatformError) {
                const { data } = error as WebAPIPlatformError;
                return `A platform error occurred: ${JSON.stringify(data)}`;
            }
            if (error.code === ErrorCode.RequestError) {
                const { original } = error as WebAPIRequestError;
                return `A request error occurred: ${JSON.stringify(original)}`;
            }
            if (error.code === ErrorCode.RateLimitedError) {
                const { retryAfter } = error as WebAPIRateLimitedError;
                return `A rate limit error occurred: retry after ${retryAfter} seconds`;
            }
            if (error.code === ErrorCode.HTTPError) {
                const { statusCode } = error as WebAPIHTTPError;
                return `An HTTP error occurred: status code ${statusCode}`;
            }
        }

        return error.message;
    }
}
