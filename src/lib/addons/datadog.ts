import Addon from './addon.js';

import definition from './datadog-definition.js';
import Mustache from 'mustache';
import {
    type IAddonConfig,
    type IFlagResolver,
    serializeDates,
} from '../types/index.js';
import {
    type FeatureEventFormatter,
    FeatureEventFormatterMd,
} from './feature-event-formatter-md.js';
import type { IEvent } from '../events/index.js';
import type { IntegrationEventState } from '../features/integration-events/integration-events-store.js';

interface IDatadogParameters {
    url?: string;
    apiKey: string;
    sourceTypeName?: string;
    customHeaders?: string;
    bodyTemplate?: string;
}

interface DDRequestBody {
    text: string;
    title: string;
    tags?: string[];
    source_type_name?: string;
}

export default class DatadogAddon extends Addon {
    private msgFormatter: FeatureEventFormatter;

    declare flagResolver: IFlagResolver;

    constructor(config: IAddonConfig) {
        super(definition, config);
        this.msgFormatter = new FeatureEventFormatterMd({
            unleashUrl: config.unleashUrl,
        });
        this.flagResolver = config.flagResolver;
    }

    async handleEvent(
        event: IEvent,
        parameters: IDatadogParameters,
        integrationId: number,
    ): Promise<void> {
        let state: IntegrationEventState = 'success';
        const stateDetails: string[] = [];

        const {
            url = 'https://api.datadoghq.com/api/v1/events',
            apiKey,
            sourceTypeName,
            customHeaders,
            bodyTemplate,
        } = parameters;

        const context = {
            event,
        };

        let text: string;
        if (typeof bodyTemplate === 'string' && bodyTemplate.length > 1) {
            text = Mustache.render(bodyTemplate, context);
        } else {
            text = `%%% \n ${this.msgFormatter.format(event).text} \n %%% `;
        }

        const { tags: eventTags } = event;
        const tags = eventTags?.map((tag) => `${tag.type}:${tag.value}`);
        const body: DDRequestBody = {
            text: text,
            title: 'Unleash notification update',
            tags,
        };
        if (sourceTypeName) {
            body.source_type_name = sourceTypeName;
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
                'Content-Type': 'application/json',
                'DD-API-KEY': apiKey,
                ...extraHeaders,
            },
            body: JSON.stringify(body),
        };
        const res = await this.fetchRetry(url, requestOpts);

        this.logger.info(`Handled event "${event.type}".`);

        if (res.ok) {
            const successMessage = `Datadog Events API request was successful with status code: ${res.status}.`;
            stateDetails.push(successMessage);
            this.logger.info(successMessage);
        } else {
            state = 'failed';
            const failedMessage = `Datadog Events API request failed with status code: ${res.status}.`;
            stateDetails.push(failedMessage);
            this.logger.warn(failedMessage);
        }

        this.registerEvent({
            integrationId,
            state,
            stateDetails: stateDetails.join('\n'),
            event: serializeDates(event),
            details: {
                url,
                body,
            },
        });
    }
}
