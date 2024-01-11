import Addon from './addon';

import definition from './datadog-definition';
import Mustache from 'mustache';
import { IAddonConfig } from '../types/model';
import {
    FeatureEventFormatter,
    FeatureEventFormatterMd,
    LinkStyle,
} from './feature-event-formatter-md';
import { IEvent } from '../types/events';

interface IDatadogParameters {
    url: string;
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

    constructor(config: IAddonConfig) {
        super(definition, config);
        this.msgFormatter = new FeatureEventFormatterMd(
            config.unleashUrl,
            LinkStyle.MD,
        );
    }

    async handleEvent(
        event: IEvent,
        parameters: IDatadogParameters,
    ): Promise<void> {
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
            } catch (e) {
                this.logger.warn(
                    `Could not parse the json in the customHeaders parameter. [${customHeaders}]`,
                );
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
        this.logger.info(
            `Handled event ${event.type}. Status codes=${res.status}`,
        );
    }
}
