import Mustache from 'mustache';
import Addon from './addon.js';
import definition from './webhook-definition.js';
import type { IEvent } from '../events/index.js';
import {
    type IAddonConfig,
    type IFlagResolver,
    serializeDates,
} from '../types/index.js';
import type { IntegrationEventState } from '../features/integration-events/integration-events-store.js';
import {
    type FeatureEventFormatter,
    FeatureEventFormatterMd,
} from './feature-event-formatter-md.js';

interface IParameters {
    url: string;
    serviceName?: string;
    bodyTemplate?: string;
    contentType?: string;
    authorization?: string;
    customHeaders?: string;
}

const isInsideDoubleQuotedString = (value: string, offset: number): boolean => {
    let inString = false;
    let escaped = false;

    for (let i = 0; i < offset; i++) {
        const char = value[i];
        if (escaped) {
            escaped = false;
        } else if (char === '\\') {
            escaped = true;
        } else if (char === '"') {
            inString = !inString;
        }
    }

    return inString;
};

export default class Webhook extends Addon {
    private msgFormatter: FeatureEventFormatter;

    declare flagResolver: IFlagResolver;

    constructor(args: IAddonConfig) {
        super(definition, args);
        this.msgFormatter = new FeatureEventFormatterMd({
            unleashUrl: args.unleashUrl,
        });
        this.flagResolver = args.flagResolver;
    }

    async handleEvent(
        event: IEvent,
        parameters: IParameters,
        integrationId: number,
    ): Promise<void> {
        let state: IntegrationEventState = 'success';
        const stateDetails: string[] = [];

        const {
            url,
            bodyTemplate,
            contentType = 'application/json',
            authorization,
            customHeaders,
        } = parameters;
        const eventMarkdown = this.msgFormatter.format(event).text;
        const context = {
            event,
            // Stringify twice to avoid escaping in Mustache
            eventJson: JSON.stringify(JSON.stringify(event)),
            eventMarkdown,
        };

        let body: string | undefined;
        let sendingEvent = false;

        if (typeof bodyTemplate === 'string' && bodyTemplate.length > 1) {
            const eventMarkdownPlaceholder = '\0UNLEASH_EVENT_MARKDOWN\0';
            const renderedBody = Mustache.render(bodyTemplate, {
                ...context,
                eventMarkdown: eventMarkdownPlaceholder,
            });
            const escapedEventMarkdown = JSON.stringify(eventMarkdown).slice(
                1,
                -1,
            );
            body = renderedBody.replaceAll(
                eventMarkdownPlaceholder,
                (_match, offset: number) =>
                    isInsideDoubleQuotedString(renderedBody, offset)
                        ? escapedEventMarkdown
                        : eventMarkdown,
            );
        } else {
            body = JSON.stringify(event);
            sendingEvent = true;
        }

        let extraHeaders = {};
        if (typeof customHeaders === 'string' && customHeaders.length > 1) {
            try {
                extraHeaders = JSON.parse(customHeaders);
            } catch (_e) {
                state = 'successWithErrors';
                const badHeadersMessage =
                    'Could not parse the JSON in the customHeaders parameter.';
                stateDetails.push(badHeadersMessage);
                this.logger.warn(badHeadersMessage);
            }
        }
        const requestOpts = {
            method: 'POST',
            headers: {
                'Content-Type': contentType,
                Authorization: authorization || undefined,
                ...extraHeaders,
            },
            body,
        };
        const res = await this.fetchRetry(url, requestOpts);

        this.logger.info(`Handled event "${event.type}".`);

        if (res.ok) {
            const successMessage = `Webhook request was successful with status code: ${res.status}.`;
            stateDetails.push(successMessage);
            this.logger.info(successMessage);
        } else {
            state = 'failed';
            const failedMessage = `Webhook request failed with status code: ${res.status}.`;
            stateDetails.push(failedMessage);
            this.logger.warn(failedMessage);
        }

        if (this.flagResolver.isEnabled('webhookDomainLogging')) {
            const domain = new URL(url).hostname;
            this.logger.info(`Webhook invoked`, {
                domain,
            });
        }

        this.registerEvent({
            integrationId,
            state,
            stateDetails: stateDetails.join('\n'),
            event: serializeDates(event),
            details: {
                url,
                contentType,
                body: sendingEvent ? event : body,
            },
        });
    }
}
