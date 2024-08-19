import Addon from './addon';

import definition from './new-relic-definition';
import Mustache from 'mustache';
import {
    type IAddonConfig,
    type IEvent,
    type IEventType,
    type IFlagResolver,
    serializeDates,
} from '../types';
import {
    type FeatureEventFormatter,
    FeatureEventFormatterMd,
    LinkStyle,
} from './feature-event-formatter-md';
import { gzip } from 'node:zlib';
import { promisify } from 'util';
import type { IntegrationEventState } from '../features/integration-events/integration-events-store';
import { ADDON_EVENTS_HANDLED } from '../metric-events';

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

    flagResolver: IFlagResolver;

    constructor(config: IAddonConfig) {
        super(definition, config);
        this.msgFormatter = new FeatureEventFormatterMd(
            config.unleashUrl,
            LinkStyle.MD,
        );
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

        if (this.flagResolver.isEnabled('addonUsageMetrics')) {
            this.eventBus.emit(ADDON_EVENTS_HANDLED, {
                result: state,
                destination: 'new-relic',
            });
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
