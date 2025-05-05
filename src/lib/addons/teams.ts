import Addon from './addon.js';

import teamsDefinition from './teams-definition.js';
import {
    type IAddonConfig,
    type IFlagResolver,
    serializeDates,
} from '../types/index.js';
import {
    type FeatureEventFormatter,
    FeatureEventFormatterMd,
} from './feature-event-formatter-md.js';
import type { IEvent } from '../types/shared.js';
import type { IntegrationEventState } from '../features/integration-events/integration-events-store.js';

import {
    CHANGE_ADDED,
    CHANGE_DISCARDED,
    CHANGE_EDITED,
    CHANGE_REQUEST_APPLIED,
    CHANGE_REQUEST_APPROVAL_ADDED,
    CHANGE_REQUEST_APPROVED,
    CHANGE_REQUEST_CANCELLED,
    CHANGE_REQUEST_CREATED,
    CHANGE_REQUEST_DISCARDED,
    CHANGE_REQUEST_REJECTED,
    CHANGE_REQUEST_SENT_TO_REVIEW,
    CHANGE_REQUEST_SCHEDULED,
    CHANGE_REQUEST_SCHEDULED_APPLICATION_SUCCESS,
    CHANGE_REQUEST_SCHEDULED_APPLICATION_FAILURE,
    CHANGE_REQUEST_SCHEDULE_SUSPENDED,
} from '../types/shared.js';

interface ITeamsParameters {
    url: string;
    customHeaders?: string;
}
export default class TeamsAddon extends Addon {
    private msgFormatter: FeatureEventFormatter;

    declare flagResolver: IFlagResolver;

    constructor(args: IAddonConfig) {
        if (args.flagResolver.isEnabled('teamsIntegrationChangeRequests')) {
            teamsDefinition.events = [
                ...teamsDefinition.events!,
                CHANGE_ADDED,
                CHANGE_DISCARDED,
                CHANGE_EDITED,
                CHANGE_REQUEST_APPLIED,
                CHANGE_REQUEST_APPROVAL_ADDED,
                CHANGE_REQUEST_APPROVED,
                CHANGE_REQUEST_CANCELLED,
                CHANGE_REQUEST_CREATED,
                CHANGE_REQUEST_DISCARDED,
                CHANGE_REQUEST_REJECTED,
                CHANGE_REQUEST_SENT_TO_REVIEW,
                CHANGE_REQUEST_SCHEDULED,
                CHANGE_REQUEST_SCHEDULED_APPLICATION_SUCCESS,
                CHANGE_REQUEST_SCHEDULED_APPLICATION_FAILURE,
                CHANGE_REQUEST_SCHEDULE_SUSPENDED,
            ];
        }
        super(teamsDefinition, args);
        this.msgFormatter = new FeatureEventFormatterMd({
            unleashUrl: args.unleashUrl,
        });
        this.flagResolver = args.flagResolver;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async handleEvent(
        event: IEvent,
        parameters: ITeamsParameters,
        integrationId: number,
    ): Promise<void> {
        let state: IntegrationEventState = 'success';
        const stateDetails: string[] = [];

        const { url, customHeaders } = parameters;
        const { createdBy } = event;
        const { text, url: featureLink } = this.msgFormatter.format(event);

        const body = {
            themeColor: '0076D7',
            summary: 'Message',
            sections: [
                {
                    activityTitle: text,
                    activitySubtitle: 'Unleash notification update',
                    facts: [
                        {
                            name: 'User',
                            value: createdBy,
                        },
                        {
                            name: 'Action',
                            value: event.type,
                        },
                    ],
                },
            ],
            potentialAction: [
                {
                    '@type': 'OpenUri',
                    name: 'Go to feature',
                    targets: [
                        {
                            os: 'default',
                            uri: featureLink,
                        },
                    ],
                },
            ],
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
            headers: { 'Content-Type': 'application/json', ...extraHeaders },
            body: JSON.stringify(body),
        };
        const res = await this.fetchRetry(url, requestOpts);

        this.logger.info(`Handled event "${event.type}".`);

        if (res.ok) {
            const successMessage = `Teams webhook request was successful with status code: ${res.status}.`;
            stateDetails.push(successMessage);
            this.logger.info(successMessage);
        } else {
            state = 'failed';
            const failedMessage = `Teams webhook request failed with status code: ${res.status}.`;
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
