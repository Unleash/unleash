import YAML from 'js-yaml';
import Addon from './addon';

import {
    FEATURE_ARCHIVED,
    FEATURE_CREATED,
    FEATURE_ENVIRONMENT_DISABLED,
    FEATURE_ENVIRONMENT_ENABLED,
    FEATURE_METADATA_UPDATED,
    FEATURE_PROJECT_CHANGE,
    FEATURE_REVIVED,
    FEATURE_STALE_OFF,
    FEATURE_STALE_ON,
    FEATURE_STRATEGY_ADD,
    FEATURE_STRATEGY_REMOVE,
    FEATURE_STRATEGY_UPDATE,
    FEATURE_UPDATED,
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
        } else if (
            [
                FEATURE_ENVIRONMENT_DISABLED,
                FEATURE_ENVIRONMENT_ENABLED,
            ].includes(event.type)
        ) {
            text = this.generateEnvironmentToggleText(event);
        } else if (
            [
                FEATURE_STRATEGY_ADD,
                FEATURE_STRATEGY_REMOVE,
                FEATURE_STRATEGY_UPDATE,
            ].includes(event.type)
        ) {
            text = this.generateStrategyChangeText(event);
        } else if (FEATURE_METADATA_UPDATED === event.type) {
            text = this.generateMetadataText(event);
        } else if (FEATURE_PROJECT_CHANGE === event.type) {
            text = this.generateProjectChangeText(event);
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

    generateEnvironmentToggleText(event: IEvent): string {
        const { environment, project, data, type } = event;
        const toggleStatus =
            type === FEATURE_ENVIRONMENT_ENABLED ? 'enabled' : 'disabled';
        const feature = `<${this.featureLink(event)}|${data.name}>`;
        return `The feature toggle *${feature}* in the ${project} project had the environment ${environment} ${toggleStatus}`;
    }

    generateStrategyChangeText(event: IEvent): string {
        const { environment, project, data, type } = event;
        const feature = `<${this.featureLink(event)}|${data.featureName}>`;
        let action;
        if (FEATURE_STRATEGY_UPDATE === type) {
            action = 'updated in';
        } else if (FEATURE_STRATEGY_ADD) {
            action = 'added to';
        } else {
            action = 'removed from';
        }
        const strategyText = `a ${data.name} strategy ${action} the *${environment}* environment`;
        return `The feature toggle *${feature}* in project: ${project} had ${strategyText}`;
    }

    generateMetadataText(event: IEvent): string {
        const { createdBy, project, data } = event;
        const feature = `<${this.featureLink(event)}|${data.name}>`;
        return `${createdBy} updated the metadata for ${feature} in project ${project}`;
    }

    generateProjectChangeText(event: IEvent): string {
        const { createdBy, project, data } = event;
        return `${createdBy} moved ${data.name} to ${project}`;
    }

    strategiesLink(event: IEvent): string {
        const { project, environment, data } = event;
        return `${this.unleashUrl}/projects/${project}/features/${data.featureName}/environments/${environment}/strategies/${event.id}`;
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
        const strategies = `*Activation strategies*: \n${YAML.dump(
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
