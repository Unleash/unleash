import Addon from './addon';

import slackDefinition from './slack-definition';
import { type IAddonConfig, serializeDates } from '../types';

import {
    type FeatureEventFormatter,
    FeatureEventFormatterMd,
    LinkStyle,
} from './feature-event-formatter-md';
import type { IEvent } from '../types/events';
import type { IntegrationEventState } from '../features/integration-events/integration-events-store';

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
        integrationId: number,
    ): Promise<void> {
        let state: IntegrationEventState = 'success';
        const stateDetails: string[] = [];

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

        let extraHeaders = {};
        if (typeof customHeaders === 'string' && customHeaders.length > 1) {
            try {
                extraHeaders = JSON.parse(customHeaders);
            } catch (e) {
                const detailMessage =
                    'Could not parse the JSON in the customHeaders parameter.';
                state = 'successWithErrors';
                stateDetails.push(detailMessage);
                this.logger.warn(detailMessage);
            }
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
        const failedRequests = results.filter((res) => !res.ok);
        const codes = this.getUniqueArray(
            results.map((res) => res.status),
        ).join(', ');

        this.logger.info(`Handled event ${event.type}.`);

        if (failedRequests.length === 0) {
            const detailMessage = `All (${results.length}) Slack webhook requests were successful with status codes: ${codes}.`;
            stateDetails.push(detailMessage);
            this.logger.info(detailMessage);
        } else if (failedRequests.length === results.length) {
            const detailMessage = `All (${results.length}) Slack webhook requests failed with status codes: ${codes}.`;
            state = 'failed';
            stateDetails.push(detailMessage);
            this.logger.warn(detailMessage);
        } else {
            const detailMessage = `Some (${failedRequests.length} of ${results.length}) Slack webhook requests failed. Status codes: ${codes}.`;
            state = 'successWithErrors';
            stateDetails.push(detailMessage);
            this.logger.warn(detailMessage);
        }

        this.registerEvent({
            integrationId,
            state,
            stateDetails: stateDetails.join('\n'),
            event: serializeDates(event),
            details: {
                url,
                channels: slackChannels,
                username,
                text,
            },
        });
    }

    getUniqueArray<T>(arr: T[]): T[] {
        return [...new Set(arr)];
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
