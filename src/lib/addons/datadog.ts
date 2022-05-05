import Addon from './addon';

import definition from './datadog-definition';
import { IAddonConfig } from '../types/model';
import {
    FeatureEventFormatter,
    FeatureEventFormatterMd,
    LinkStyle,
} from './feature-event-formatter-md';
import { IEvent } from '../types/events';

export default class DatadogAddon extends Addon {
    private msgFormatter: FeatureEventFormatter;

    constructor(config: IAddonConfig) {
        super(definition, config);
        this.msgFormatter = new FeatureEventFormatterMd(
            config.unleashUrl,
            LinkStyle.MD,
        );
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async handleEvent(event: IEvent, parameters: any): Promise<void> {
        const { url = 'https://api.datadoghq.com/api/v1/events', apiKey } =
            parameters;

        const text = this.msgFormatter.format(event);

        const { tags: eventTags } = event;
        const tags =
            eventTags && eventTags.map((tag) => `${tag.type}:${tag.value}`);
        const body = {
            text: `%%% \n ${text} \n %%% `,
            title: 'Unleash notification update',
            tags,
        };

        const requestOpts = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'DD-API-KEY': apiKey,
            },
            body: JSON.stringify(body),
        };
        const res = await this.fetchRetry(url, requestOpts);
        this.logger.info(
            `Handled event ${event.type}. Status codes=${res.status}`,
        );
    }
}
