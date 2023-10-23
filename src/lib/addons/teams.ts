import Addon from './addon';

import teamsDefinition from './teams-definition';
import { IAddonConfig } from '../types/model';
import {
    FeatureEventFormatter,
    FeatureEventFormatterMd,
} from './feature-event-formatter-md';
import { IEvent } from '../types/events';

interface ITeamsParameters {
    url: string;
    customHeaders?: string;
}
export default class TeamsAddon extends Addon {
    private msgFormatter: FeatureEventFormatter;

    constructor(args: IAddonConfig) {
        super(teamsDefinition, args);
        this.msgFormatter = new FeatureEventFormatterMd(args.unleashUrl);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async handleEvent(
        event: IEvent,
        parameters: ITeamsParameters,
    ): Promise<void> {
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
                this.logger.warn(
                    `Could not parse the json in the customHeaders parameter. [${customHeaders}]`,
                );
            }
        }

        const requestOpts = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...extraHeaders },
            body: JSON.stringify(body),
        };
        const res = await this.fetchRetry(url, requestOpts);
        this.logger.info(
            `Handled event ${event.type}. Status codes=${res.status}`,
        );
    }
}
