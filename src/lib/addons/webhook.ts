import Mustache from 'mustache';
import Addon from './addon';
import definition from './webhook-definition';
import type { IEvent } from '../types/events';
import {
    type IAddonConfig,
    type IFlagResolver,
    serializeDates,
} from '../types';
import type { IntegrationEventState } from '../features/integration-events/integration-events-store';
import {
    type FeatureEventFormatter,
    FeatureEventFormatterMd,
    LinkStyle,
} from './feature-event-formatter-md';
import { ADDON_EVENTS_HANDLED } from '../metric-events';

interface IParameters {
    url: string;
    serviceName?: string;
    bodyTemplate?: string;
    contentType?: string;
    authorization?: string;
    customHeaders?: string;
}

export default class Webhook extends Addon {
    private msgFormatter: FeatureEventFormatter;

    flagResolver: IFlagResolver;

    constructor(args: IAddonConfig) {
        super(definition, args);
        this.msgFormatter = new FeatureEventFormatterMd(
            args.unleashUrl,
            LinkStyle.MD,
        );
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
        const context = {
            event,
            // Stringify twice to avoid escaping in Mustache
            eventJson: JSON.stringify(JSON.stringify(event)),
            eventMarkdown: this.msgFormatter.format(event).text,
        };

        let body: string | undefined;
        let sendingEvent = false;

        if (typeof bodyTemplate === 'string' && bodyTemplate.length > 1) {
            body = Mustache.render(bodyTemplate, context);
        } else {
            body = JSON.stringify(event);
            sendingEvent = true;
        }

        let extraHeaders = {};
        if (typeof customHeaders === 'string' && customHeaders.length > 1) {
            try {
                extraHeaders = JSON.parse(customHeaders);
            } catch (e) {
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

        if (this.flagResolver.isEnabled('addonUsageMetrics')) {
            this.eventBus.emit(ADDON_EVENTS_HANDLED, {
                result: state,
                destination: 'webhook',
            });
        }

        const domain = new URL(url).hostname;
        this.logger.info(`Webhook invoked`, {
            domain,
        });

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
