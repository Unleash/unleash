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

export enum LinkStyle {
    SLACK,
    MD,
}

export class FeatureEventFormatterMd implements FeatureEventFormatter {
    private unleashUrl: string;

    private linkStyle: LinkStyle;

    constructor(unleashUrl: string, linkStyle: LinkStyle = LinkStyle.MD) {
        this.unleashUrl = unleashUrl;
        this.linkStyle = linkStyle;
    }

    generateArchivedText(event: IEvent): string {
        const { createdBy, type } = event;
        const action = type === FEATURE_ARCHIVED ? 'archived' : 'revived';
        const feature = this.generateFeatureLink(event);
        return ` ${createdBy} just ${action} feature toggle *${feature}*`;
    }

    generateFeatureLink(event: IEvent): string {
        if (this.linkStyle === LinkStyle.SLACK) {
            return `<${this.featureLink(event)}|${event.data.name}>`;
        } else {
            return `[${event.data.name}](${this.featureLink(event)})`;
        }
    }

    generateStaleText(event: IEvent): string {
        const { createdBy, type } = event;
        const isStale = type === FEATURE_STALE_ON;
        const feature = this.generateFeatureLink(event);

        if (isStale) {
            return `${createdBy} marked ${feature}  as stale and this feature toggle is now *ready to be removed* from the code.`;
        }
        return `${createdBy} removed the stale marking on *${feature}*.`;
    }

    generateEnvironmentToggleText(event: IEvent): string {
        const { createdBy, environment, type, project } = event;
        const toggleStatus =
            type === FEATURE_ENVIRONMENT_ENABLED ? 'enabled' : 'disabled';
        const feature = this.generateFeatureLink(event);
        return `${createdBy} *${toggleStatus}* ${feature} in *${environment}* environment in project *${project}*`;
    }

    generateStrategyChangeText(event: IEvent): string {
        const { createdBy, environment, project, data, type } = event;
        const feature = this.generateFeatureLink(event);
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
        } strategy ${action} the *${environment}* environment`;
        return `${createdBy} updated *${feature}* with ${strategyText} in project *${project}*`;
    }

    generateMetadataText(event: IEvent): string {
        const { createdBy, project } = event;
        const feature = this.generateFeatureLink(event);
        return `${createdBy} updated the metadata for ${feature} in project *${project}*`;
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
        const { createdBy, project, type } = event;
        const action = this.getAction(type);
        const feature = this.generateFeatureLink(event);
        return `${createdBy} ${action} feature toggle ${feature} in project *${project}*`;
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
