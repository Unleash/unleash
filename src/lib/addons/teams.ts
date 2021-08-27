import YAML from 'js-yaml';
import Addon from './addon';

import {
    FEATURE_CREATED,
    FEATURE_UPDATED,
    FEATURE_ARCHIVED,
    FEATURE_REVIVED,
    FEATURE_STALE_ON,
    FEATURE_STALE_OFF,
} from '../types/events';
import { LogProvider } from '../logger';

import teamsDefinition from './teams-definition';
import { IEvent } from '../types/model';

export default class TeamsAddon extends Addon {
    unleashUrl: string;

    constructor(args: { unleashUrl: string; getLogger: LogProvider }) {
        super(teamsDefinition, args);
        this.unleashUrl = args.unleashUrl;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async handleEvent(event: IEvent, parameters: any): Promise<void> {
        const { url } = parameters;
        const { createdBy, data, type } = event;
        let text = '';
        if ([FEATURE_ARCHIVED, FEATURE_REVIVED].includes(event.type)) {
            text = this.generateArchivedText(event);
        } else if ([FEATURE_STALE_ON, FEATURE_STALE_OFF].includes(event.type)) {
            text = this.generateStaleText(event);
        } else {
            text = this.generateText(event);
        }

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
                            value: this.getAction(type),
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
                            uri: this.featureLink(event),
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

    featureLink(event: IEvent): string {
        const path = event.type === FEATURE_ARCHIVED ? 'archive' : 'features';
        return `${this.unleashUrl}/${path}/strategies/${event.data.name}`;
    }

    generateStaleText(event: IEvent): string {
        const { data, type } = event;
        const isStale = type === FEATURE_STALE_ON;
        if (isStale) {
            return `The feature toggle *${data.name}* is now *ready to be removed* from the code.`;
        }
        return `The feature toggle *${data.name}* was *unmarked* as stale`;
    }

    generateArchivedText(event: IEvent): string {
        const { data, type } = event;
        const action = type === FEATURE_ARCHIVED ? 'archived' : 'revived';
        return `The feature toggle *${data.name}* was *${action}*`;
    }

    generateText(event: IEvent): string {
        const { data } = event;
        const typeStr = `*Type*: ${data.type}`;
        const project = `*Project*: ${data.project}`;
        const strategies = `*Activation strategies*: \n${YAML.safeDump(
            data.strategies,
            { skipInvalid: true },
        )}`;
        return `Feature toggle ${data.name} | ${typeStr} | ${project} <br /> ${
            data.strategies ? strategies : ''
        }`;
    }

    getAction(type: string): string {
        switch (type) {
            case FEATURE_CREATED:
                return 'Create';
            case FEATURE_UPDATED:
                return 'Update';
            default:
                return type;
        }
    }
}
