import Mustache from 'mustache';
import Addon from './addon';
import definition from './webhook-definition';
import type { IEvent } from '../types/events';
import { type IAddonConfig, serializeDates } from '../types';
import type { IntegrationEventState } from '../features/integration-events/integration-events-store';

interface IParameters {
    url: string;
    bodyTemplate?: string;
    contentType?: string;
    authorization?: string;
    customHeaders?: string;
}

export default class Webhook extends Addon {
    constructor(args: IAddonConfig) {
        super(definition, args);
    }

    async handleEvent(
        event: IEvent,
        parameters: IParameters,
        integrationId: number,
    ): Promise<void> {
        let state: IntegrationEventState = 'success';
        const stateDetails: string[] = [];

        const { url, bodyTemplate, contentType, authorization, customHeaders } =
            parameters;
        const context = {
            event,
            // Stringify twice to avoid escaping in Mustache
            eventJson: JSON.stringify(JSON.stringify(event)),
        };

        let body: string | undefined;

        if (typeof bodyTemplate === 'string' && bodyTemplate.length > 1) {
            body = Mustache.render(bodyTemplate, context);
        } else {
            body = JSON.stringify(event);
        }

        let extraHeaders = {};
        if (typeof customHeaders === 'string' && customHeaders.length > 1) {
            try {
                extraHeaders = JSON.parse(customHeaders);
            } catch (e) {
                const errorMessage =
                    'Could not parse the JSON in the customHeaders parameter.';
                state = 'successWithErrors';
                stateDetails.push(errorMessage);
                this.logger.warn(errorMessage);
            }
        }
        const requestOpts = {
            method: 'POST',
            headers: {
                'Content-Type': contentType || 'application/json',
                Authorization: authorization || undefined,
                ...extraHeaders,
            },
            body,
        };
        const res = await this.fetchRetry(url, requestOpts);

        this.logger.info(
            `Handled event "${event.type}". Status code: ${res.status}`,
        );

        if (res.ok) {
            stateDetails.push(
                `Webhook request was successful with status code: ${res.status}.`,
            );
        } else {
            state = 'failed';
            stateDetails.push(
                `Webhook request failed with status code: ${res.status}.`,
            );
        }

        this.registerEvent({
            integrationId,
            state,
            stateDetails: stateDetails.join('\n'),
            event: serializeDates(event),
            details: {
                url,
                contentType,
                body,
            },
        });
    }
}
