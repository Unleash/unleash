import YAML from 'js-yaml';
import Addon from './addon';
import {
    FEATURE_CREATED,
    FEATURE_UPDATED,
    FEATURE_ARCHIVED,
    FEATURE_REVIVED,
    FEATURE_STALE_ON,
    FEATURE_STALE_OFF,
    FEATURE_ENVIRONMENT_ENABLED,
    FEATURE_STRATEGY_UPDATE,
    FEATURE_STRATEGY_ADD,
    FEATURE_ENVIRONMENT_DISABLED,
    FEATURE_STRATEGY_REMOVE,
    FEATURE_METADATA_UPDATED,
    FEATURE_PROJECT_CHANGE,
} from '../types/events';

import definition from './datadog-definition';
import { LogProvider } from '../logger';
import { IEvent } from '../types/model';

export default class DatadogAddon extends Addon {
    unleashUrl: string;

    constructor(config: { unleashUrl: string; getLogger: LogProvider }) {
        super(definition, config);
        this.unleashUrl = config.unleashUrl;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async handleEvent(event: IEvent, parameters: any): Promise<void> {
        const { url = 'https://api.datadoghq.com/api/v1/events', apiKey } =
            parameters;
        let text;

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

        const { tags: eventTags } = event;
        const tags =
            eventTags && eventTags.map((tag) => `${tag.value}:${tag.type}`);
        const body = {
            text: `%%% \n ${text} \n %%% `,
            title: 'Unleash notification update',
            tags,
        };

        const requestOpts = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'DD-API-KEY': apiKey,
            },
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
        return `The feature toggle *${feature}* in the ${project} project was ${toggleStatus} in environment *${environment}*`;
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
        return `${this.unleashUrl}/projects/${event.project}/features/${event.data.featureName}/strategies/${event.id}`;
    }

    featureLink(event: IEvent): string {
        const path = event.type === FEATURE_ARCHIVED ? 'archive' : 'features';
        return `${this.unleashUrl}/${path}/strategies/${event.data.name}`;
    }

    generateStaleText(event: IEvent): string {
        const { createdBy, data, type } = event;
        const isStale = type === FEATURE_STALE_ON;
        const feature = `[${data.name}](${this.featureLink(event)})`;

        if (isStale) {
            return `The feature toggle *${feature}* is now *ready to be removed* from the code.
This was changed by ${createdBy}.`;
        }
        return `The feature toggle *${feature}* was *unmarked as stale* by ${createdBy}.`;
    }

    generateArchivedText(event: IEvent): string {
        const { createdBy, data, type } = event;
        const action = type === FEATURE_ARCHIVED ? 'archived' : 'revived';
        const feature = `[${data.name}](${this.featureLink(event)})`;
        return `The feature toggle *${feature}* was *${action}* by ${createdBy}.`;
    }

    generateText(event: IEvent): string {
        const { createdBy, data, type } = event;
        const action = this.getAction(type);
        const feature = `[${data.name}](${this.featureLink(event)})`;
        const enabled = `**Enabled**: ${data.enabled ? 'yes' : 'no'}`;
        const stale = data.stale ? '("stale")' : '';
        const typeStr = `**Type**: ${data.type}`;
        const project = `**Project**: ${data.project}`;
        const strategies = `**Activation strategies**: \`\`\`${YAML.dump(
            data.strategies,
            { skipInvalid: true },
        )}\`\`\``;
        return `${createdBy} ${action} feature toggle ${feature}
${enabled}${stale} | ${typeStr} | ${project}
${data.strategies ? strategies : ''}`;
    }

    getAction(type: string): string {
        switch (type) {
            case FEATURE_CREATED:
                return 'created';
            case FEATURE_UPDATED:
                return 'updated';
            default:
                return type;
        }
    }
}
