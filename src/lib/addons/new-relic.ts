import Addon from './addon.js';

import definition from './new-relic-definition.js';
import Mustache from 'mustache';
import {
    type IAddonConfig,
    type IFlagResolver,
    serializeDates,
} from '../types/index.js';
import type { IEvent, IEventType } from '../events/index.js';
import {
    type FeatureEventFormatter,
    FeatureEventFormatterMd,
} from './feature-event-formatter-md.js';
import { gzip } from 'node:zlib';
import { promisify } from 'util';
import type { IntegrationEventState } from '../features/integration-events/integration-events-store.js';

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
        parameters: INewRelicParameters,
        integrationId: number,
    ): Promise<void> {
        let state: IntegrationEventState = 'success';
        const stateDetails: string[] = [];

        const { url, licenseKey, customHeaders, bodyTemplate } = parameters;
        const context = {
            event,
        };

        let _text: string;
        if (typeof bodyTemplate === 'string' && bodyTemplate.length > 1) {
            _text = Mustache.render(bodyTemplate, context);
        } else {
            _text = `%%% \n ${this.msgFormatter.format(event).text} \n %%% `;
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
                'Api-Key': licenseKey,
                'Content-Type': 'application/json',
                'Content-Encoding': 'gzip',
                ...extraHeaders,
            },
            body: await asyncGzip(JSON.stringify(body)),
        };

        const res = await this.fetchRetry(url, requestOpts);

        this.logger.info(`Handled event "${event.type}".`);

        if (res.ok) {
            const successMessage = `New Relic Events API request was successful with status code: ${res.status}.`;
            stateDetails.push(successMessage);
            this.logger.info(successMessage);
        } else {
            state = 'failed';
            const failedMessage = `New Relic Events API request failed with status code: ${res.status}.`;
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
