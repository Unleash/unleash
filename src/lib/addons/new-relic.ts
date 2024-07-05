import Addon from './addon';

import definition from './new-relic-definition';
import Mustache from 'mustache';
import type { IAddonConfig, IEvent, IEventType } from '../types';
import {
    type FeatureEventFormatter,
    FeatureEventFormatterMd,
    LinkStyle,
} from './feature-event-formatter-md';
import { gzip } from 'node:zlib';
import { promisify } from 'util';

const asyncGzip = promisify(gzip);

export interface INewRelicParameters {
    url: string;
    licenseKey: string;
    customHeaders?: string;
    bodyTemplate?: string;
}

interface INewRelicRequestBody {
    eventType: 'Unleash Service Event';
    unleashEventType: IEventType;
    featureName: IEvent['featureName'];
    environment: IEvent['environment'];
    createdBy: IEvent['createdBy'];
    createdByUserId: IEvent['createdByUserId'];
    createdAt: IEvent['createdAt'];
}

export default class NewRelicAddon extends Addon {
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
        parameters: INewRelicParameters,
    ): Promise<void> {
        const { url, licenseKey, customHeaders, bodyTemplate } = parameters;
        const context = {
            event,
        };

        let text: string;
        if (typeof bodyTemplate === 'string' && bodyTemplate.length > 1) {
            text = Mustache.render(bodyTemplate, context);
        } else {
            text = `%%% \n ${this.msgFormatter.format(event).text} \n %%% `;
        }

        const body: INewRelicRequestBody = {
            eventType: 'UnleashServiceEvent',
            unleashEventType: event.type,
            featureName: event.featureName,
            environment: event.environment,
            createdBy: event.createdBy,
            createdByUserId: event.createdByUserId,
            createdAt: event.createdAt.getTime(),
            ...event.data,
        };

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
                'Api-Key': licenseKey,
                'Content-Type': 'application/json',
                'Content-Encoding': 'gzip',
                ...extraHeaders,
            },
            body: await asyncGzip(JSON.stringify(body)),
        };

        const res = await this.fetchRetry(url, requestOpts);
        this.logger.info(
            `Handled event ${event.type}. Status codes=${res.status}`,
        );
    }
}
