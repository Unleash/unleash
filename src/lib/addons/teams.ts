import Addon from './addon';

import teamsDefinition from './teams-definition';
import { IAddonConfig } from '../types/model';
import {
    FeatureEventFormatter,
    FeatureEventFormatterMd,
} from './feature-event-formatter-md';
import { IEvent } from '../types/events';

export default class TeamsAddon extends Addon {
    private msgFormatter: FeatureEventFormatter;

    constructor(args: IAddonConfig) {
        super(teamsDefinition, args);
        this.msgFormatter = new FeatureEventFormatterMd(args.unleashUrl);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async handleEvent(event: IEvent, parameters: any): Promise<void> {
        const { url } = parameters;
        const { createdBy } = event;
        const text = this.msgFormatter.format(event);
        const featureLink = this.msgFormatter.featureLink(event);

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

        const requestOpts = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };
        const res = await this.fetchRetry(url, requestOpts);
        this.logger.info(
            `Handled event ${event.type}. Status codes=${res.status}`,
        );
    }
}
