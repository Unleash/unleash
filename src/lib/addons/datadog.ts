import Addon from './addon';

import definition from './datadog-definition';
import { IAddonConfig } from '../types/model';
import {
    FeatureEventFormatter,
    FeatureEventFormatterMd,
    LinkStyle,
} from './feature-event-formatter-md';
import { IEvent } from '../types/events';
import { IFeatureTagStore, ITag } from '../types';

interface IDatadogParameters {
    url: string;
    apiKey: string;
    sourceTypeName?: string;
    customHeaders?: string;
}

interface DDRequestBody {
    text: string;
    title: string;
    tags?: string[];
    source_type_name?: string;
}

interface IDatadogAddonConfig extends IAddonConfig {
    featureTagStore: IFeatureTagStore;
}

export default class DatadogAddon extends Addon {
    private msgFormatter: FeatureEventFormatter;

    private featureTagStore: IFeatureTagStore;

    constructor(config: IDatadogAddonConfig) {
        super(definition, config);
        this.msgFormatter = new FeatureEventFormatterMd(
            config.unleashUrl,
            LinkStyle.MD,
        );
        this.featureTagStore = config.featureTagStore;
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
        } = parameters;

        const text = this.msgFormatter.format(event);

        const eventTags = await this.getFeatureTags(event);

        const tags =
            eventTags && eventTags.map((tag) => `${tag.type}:${tag.value}`);
        const body: DDRequestBody = {
            text: `%%% \n ${text} \n %%% `,
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

    async getFeatureTags({
        featureName,
    }: Pick<IEvent, 'featureName'>): Promise<ITag[]> {
        if (featureName) {
            return this.featureTagStore.getAllTagsForFeature(featureName);
        }
        return [];
    }
}
