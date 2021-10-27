import YAML from 'js-yaml';
import { IEvent } from '../types/model';
import {
    FEATURE_CREATED,
    FEATURE_UPDATED,
    FEATURE_ARCHIVED,
    FEATURE_STALE_ON,
    FEATURE_STRATEGY_UPDATE,
    FEATURE_STRATEGY_ADD,
    FEATURE_ENVIRONMENT_ENABLED,
    FEATURE_REVIVED,
    FEATURE_STALE_OFF,
    FEATURE_ENVIRONMENT_DISABLED,
    FEATURE_STRATEGY_REMOVE,
    FEATURE_METADATA_UPDATED,
    FEATURE_PROJECT_CHANGE,
} from '../types/events';

export interface FeatureEventFormatter {
    format: (event: IEvent) => string;
    featureLink: (event: IEvent) => string;
}

export class FeatureEventFormatterMd implements FeatureEventFormatter {
    private unleashUrl: string;

    constructor(unleashUrl: string) {
        this.unleashUrl = unleashUrl;
    }

    generateArchivedText(event: IEvent): string {
        const { createdBy, data, type } = event;
        const action = type === FEATURE_ARCHIVED ? 'archived' : 'revived';
        const feature = `<${this.featureLink(event)}|${data.name}>`;
        return ` ${createdBy} just ${action} feature toggle *${feature}*`;
    }

    generateStaleText(event: IEvent): string {
        const { createdBy, data, type } = event;
        const isStale = type === FEATURE_STALE_ON;
        const feature = `<${this.featureLink(event)}|${data.name}>`;

        if (isStale) {
            return `The feature toggle *${feature}* is now *ready to be removed* from the code. :technologist:
    This was changed by ${createdBy}.`;
        }
        return `The feature toggle *${feature}* was *unmarked as stale* by ${createdBy}.`;
    }

    generateEnvironmentToggleText(event: IEvent): string {
        const { createdBy, environment, data, type } = event;
        const toggleStatus =
            type === FEATURE_ENVIRONMENT_ENABLED ? 'enabled' : 'disabled';
        const feature = `<${this.featureLink(event)}|${data.name}>`;
        return `${createdBy} *${toggleStatus}* ${feature} in *${environment}* environment`;
    }

    generateStrategyChangeText(event: IEvent): string {
        const { createdBy, environment, project, data, type } = event;
        const feature = `<${this.featureLink(event)}|${data.name}>`;
        let action;
        if (FEATURE_STRATEGY_UPDATE === type) {
            action = 'updated in';
        } else if (FEATURE_STRATEGY_ADD === type) {
            action = 'added to';
        } else {
            action = 'removed from';
        }
        const strategyText = `a ${
            data.strategyName ?? ''
        } *strategy ${action}* the *${environment}* environment`;
        return `${createdBy} updated *${feature}* (project: ${project}) with ${strategyText}`;
    }

    generateMetadataText(event: IEvent): string {
        const { createdBy, project, data } = event;
        const feature = `<${this.featureLink(event)}|${data.name}>`;
        return `${createdBy} updated the metadata for ${feature} (project: ${project})`;
    }

    generateProjectChangeText(event: IEvent): string {
        const { createdBy, project, data } = event;
        return `${createdBy} moved ${data.name} to ${project}`;
    }

    featureLink(event: IEvent): string {
        const { type, project = '', data } = event;
        if (type === FEATURE_ARCHIVED) {
            return `${this.unleashUrl}/archive`;
        }
        return `${this.unleashUrl}/projects/${project}/${data.name}`;
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

    defaultText(event: IEvent): string {
        const { createdBy, data, type } = event;
        const action = this.getAction(type);
        const feature = `<${this.featureLink(event)}|${data.name}>`;
        const enabled = `*Enabled*: ${data.enabled ? 'yes' : 'no'}`;
        const stale = data.stale ? '("stale")' : '';
        const typeStr = `*Type*: ${data.type}`;
        const project = `*Project*: ${data.project}`;
        const strategies = `*Activation strategies*: \`\`\`${YAML.dump(
            data.strategies,
            { skipInvalid: true },
        )}\`\`\``;
        return `${createdBy} ${action} feature toggle ${feature}
    ${enabled}${stale} | ${typeStr} | ${project}
    ${data.strategies ? strategies : ''}`;
    }

    format(event: IEvent): string {
        switch (event.type) {
            case FEATURE_ARCHIVED:
            case FEATURE_REVIVED:
                return this.generateArchivedText(event);
            case FEATURE_STALE_ON:
            case FEATURE_STALE_OFF:
                return this.generateStaleText(event);
            case FEATURE_ENVIRONMENT_DISABLED:
            case FEATURE_ENVIRONMENT_ENABLED:
                return this.generateEnvironmentToggleText(event);
            case FEATURE_STRATEGY_ADD:
            case FEATURE_STRATEGY_REMOVE:
            case FEATURE_STRATEGY_UPDATE:
                return this.generateStrategyChangeText(event);
            case FEATURE_METADATA_UPDATED:
                return this.generateMetadataText(event);
            case FEATURE_PROJECT_CHANGE:
                return this.generateProjectChangeText(event);
            default:
                return this.defaultText(event);
        }
    }
}
