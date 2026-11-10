import Addon from './addon.js';

import teamsWorkflowDefinition from './teams-workflow-definition.js';
import {
    type FeatureEventFormatter,
    FeatureEventFormatterMd,
} from './feature-event-formatter-md.js';
import {
    type IAddonConfig,
    type IFlagResolver,
    serializeDates,
} from '../types/index.js';
import type { IEvent } from '../events/index.js';
import type { IntegrationEventState } from '../features/integration-events/integration-events-store.js';

interface ITeamsWorkflowParameters {
    url: string;
    customHeaders?: string;
}

export default class TeamsWorkflowAddon extends Addon {
    private msgFormatter: FeatureEventFormatter;

    declare flagResolver: IFlagResolver;

    constructor(args: IAddonConfig) {
        super(teamsWorkflowDefinition, args);
        this.msgFormatter = new FeatureEventFormatterMd({
            unleashUrl: args.unleashUrl,
        });
        this.flagResolver = args.flagResolver;
    }

    async handleEvent(
        event: IEvent,
        parameters: ITeamsWorkflowParameters,
        integrationId: number,
    ): Promise<void> {
        let state: IntegrationEventState = 'success';
        const stateDetails: string[] = [];

        const { url, customHeaders } = parameters;
        const { createdBy } = event;
        const { text, url: featureLink } = this.msgFormatter.format(event);

        const body = {
            type: 'message',
            attachments: [
                {
                    contentType: 'application/vnd.microsoft.card.adaptive',
                    content: {
                        type: 'AdaptiveCard',
                        body: [
                            {
                                type: 'Container',
                                items: [
                                    {
                                        type: 'TextBlock',
                                        text: 'Unleash update notification',
                                        style: 'heading',
                                    },
                                    {
                                        type: 'TextBlock',
                                        text,
                                        wrap: true,
                                    },
                                    {
                                        type: 'FactSet',
                                        facts: [
                                            {
                                                title: 'User:',
                                                value: createdBy,
                                            },
                                            {
                                                title: 'Action:',
                                                value: event.type,
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                        actions: [
                            {
                                type: 'Action.OpenUrl',
                                title: 'Go to feature',
                                url: featureLink,
                            },
                        ],
                        $schema:
                            'http://adaptivecards.io/schemas/adaptive-card.json',
                        version: '1.5',
                    },
                },
            ],
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
                body,
            },
        });
    }
}
