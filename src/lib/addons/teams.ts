import Addon from './addon';

import teamsDefinition from './teams-definition';
import { IAddonConfig, IEvent } from '../types/model';
import {
    FeatureEventFormatter,
    FeatureEventFormatterMd,
} from './feature-event-formatter-md';

export default class TeamsAddon extends Addon {
    private msgFormatter: FeatureEventFormatter;

    constructor(args: IAddonConfig) {
        super(teamsDefinition, args);
        this.msgFormatter = new FeatureEventFormatterMd(args.unleashUrl);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async handleEvent(event: IEvent, parameters: any): Promise<void> {
        const { url } = parameters;
        const { createdBy, data } = event;
        const text = this.msgFormatter.format(event);
        const featureLink = this.msgFormatter.featureLink(event);

        const enabled = `*${data.enabled ? 'yes' : 'no'}*`;
        const stale = data.stale ? '("stale")' : '';
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
                        {
                            name: 'Enabled',
                            value: `${enabled}${stale}`,
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
