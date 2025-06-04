import Mustache from 'mustache';
import {
    FEATURE_ARCHIVED,
    FEATURE_STRATEGY_UPDATE,
    type IEvent,
} from '../events/index.js';
import { EVENT_MAP } from './feature-event-formatter-md-events.js';
import type { IConstraint } from '../types/index.js';

export interface IFormattedEventData {
    label: string;
    text: string;
    url?: string;
}

export interface FeatureEventFormatter {
    format: (event: IEvent) => IFormattedEventData;
}
export enum LinkStyle {
    SLACK = 0,
    MD = 1,
}

type FormatStyle = 'simple' | 'markdown';

interface IFeatureEventFormatterMdArgs {
    unleashUrl: string;
    linkStyle?: LinkStyle;
    formatStyle?: FormatStyle;
}

// This is not only formatting feature events. And it's also not only for (proper) markdown. We should probably revisit this sometime in the future and try to split it / refactor it.
export class FeatureEventFormatterMd implements FeatureEventFormatter {
    private readonly unleashUrl: string;

    private readonly linkStyle: LinkStyle;

    private readonly formatStyle: FormatStyle;

    constructor({
        unleashUrl,
        linkStyle = LinkStyle.MD,
        formatStyle = 'simple',
    }: IFeatureEventFormatterMdArgs) {
        this.unleashUrl = unleashUrl;
        this.linkStyle = linkStyle;
        this.formatStyle = formatStyle;
    }

    /**
     * Returns the bold marker based on formatStyle, or wraps text with bold markers.
     * @param text Optional text to wrap with bold markers.
     * @returns Bold marker or bolded text.
     */
    bold(text?: string): string {
        const boldChar = this.formatStyle === 'simple' ? '*' : '**';
        return text ? `${boldChar}${text}${boldChar}` : boldChar;
    }

    generateChangeRequestLink(event: IEvent): string | undefined {
        const { preData, data, project, environment } = event;
        const changeRequestId =
            data?.changeRequestId || preData?.changeRequestId;
        if (project && changeRequestId) {
            const url = `${this.unleashUrl}/projects/${project}/change-requests/${changeRequestId}`;
            const text = `#${changeRequestId}`;
            const featureLink = this.generateFeatureLink(event);
            const featureText = featureLink
                ? ` for feature flag ${this.bold(featureLink)}`
                : '';
            const environmentText = environment
                ? ` in the ${this.bold(environment)} environment`
                : '';
            const projectLink = this.generateProjectLink(event);
            const projectText = project
                ? ` in project ${this.bold(projectLink)}`
                : '';
            if (this.linkStyle === LinkStyle.SLACK) {
                return `${this.bold(`<${url}|${text}>`)}${featureText}${environmentText}${projectText}`;
            } else {
                return `${this.bold(`[${text}](${url})`)}${featureText}${environmentText}${projectText}`;
            }
        }
    }

    featureLink(event: IEvent): string | undefined {
        const { type, project = '', featureName } = event;
        if (type === FEATURE_ARCHIVED) {
            if (project) {
                return `${this.unleashUrl}/projects/${project}/archive`;
            }
            return `${this.unleashUrl}/archive`;
        }

        if (featureName) {
            return `${this.unleashUrl}/projects/${project}/features/${featureName}`;
        }
    }

    generateFeatureLink(event: IEvent): string | undefined {
        if (event.featureName) {
            if (this.linkStyle === LinkStyle.SLACK) {
                return `<${this.featureLink(event)}|${event.featureName}>`;
            } else {
                return `[${event.featureName}](${this.featureLink(event)})`;
            }
        }
    }

    generateProjectLink(event: IEvent): string | undefined {
        if (event.project) {
            if (this.linkStyle === LinkStyle.SLACK) {
                return `<${this.unleashUrl}/projects/${event.project}|${event.project}>`;
            } else {
                return `[${event.project}](${this.unleashUrl}/projects/${event.project})`;
            }
        }
    }

    getStrategyTitle(event: IEvent): string | undefined {
        return (
            event.preData?.title ||
            event.data?.title ||
            event.preData?.name ||
            event.data?.name
        );
    }

    generateFeatureStrategyChangeText(event: IEvent): string | undefined {
        const { environment, data, preData, type } = event;
        if (type === FEATURE_STRATEGY_UPDATE && (data || preData)) {
            const strategyText = () => {
                switch ((data || preData).name) {
                    case 'flexibleRollout':
                        return this.flexibleRolloutStrategyChangeText(event);
                    case 'default':
                        return this.defaultStrategyChangeText(event);
                    case 'remoteAddress':
                        return this.remoteAddressStrategyChangeText(event);
                    case 'applicationHostname':
                        return this.applicationHostnameStrategyChangeText(
                            event,
                        );
                    default:
                        return `by updating strategy ${this.bold(
                            this.getStrategyTitle(event),
                        )} in ${this.bold(environment)}`;
                }
            };

            return strategyText();
        }
    }

    private applicationHostnameStrategyChangeText(event: IEvent) {
        return this.listOfValuesStrategyChangeText(event, 'hostNames');
    }

    private remoteAddressStrategyChangeText(event: IEvent) {
        return this.listOfValuesStrategyChangeText(event, 'IPs');
    }

    private listOfValuesStrategyChangeText(
        event: IEvent,
        propertyName: string,
    ) {
        const { preData, data, environment } = event;
        const userIdText = (values) =>
            values.length === 0
                ? `empty set of ${propertyName}`
                : `[${values}]`;
        const usersText =
            preData?.parameters[propertyName] === data?.parameters[propertyName]
                ? ''
                : !preData
                  ? ` ${propertyName} to ${userIdText(
                        data?.parameters[propertyName],
                    )}`
                  : ` ${propertyName} from ${userIdText(
                        preData.parameters[propertyName],
                    )} to ${userIdText(data?.parameters[propertyName])}`;
        const constraintText = this.constraintChangeText(
            preData?.constraints,
            data?.constraints,
        );
        const segmentsText = this.segmentsChangeText(
            preData?.segments,
            data?.segments,
        );
        const strategySpecificText = [usersText, constraintText, segmentsText]
            .filter((x) => x.length)
            .join(';');
        return `by updating strategy ${this.bold(
            this.getStrategyTitle(event),
        )} in ${this.bold(environment)}${strategySpecificText}`;
    }

    private flexibleRolloutStrategyChangeText(event: IEvent) {
        const { preData, data, environment } = event;
        const {
            rollout: oldRollout,
            stickiness: oldStickiness,
            groupId: oldGroupId,
        } = preData?.parameters || {};
        const { rollout, stickiness, groupId } = data?.parameters || {};
        const stickinessText =
            oldStickiness === stickiness
                ? ''
                : !oldStickiness
                  ? ` stickiness to ${stickiness}`
                  : ` stickiness from ${oldStickiness} to ${stickiness}`;
        const rolloutText =
            oldRollout === rollout
                ? ''
                : !oldRollout
                  ? ` rollout to ${rollout}%`
                  : ` rollout from ${oldRollout}% to ${rollout}%`;
        const groupIdText =
            oldGroupId === groupId
                ? ''
                : !oldGroupId
                  ? ` groupId to ${groupId}`
                  : ` groupId from ${oldGroupId} to ${groupId}`;
        const constraintText = this.constraintChangeText(
            preData?.constraints,
            data?.constraints,
        );
        const segmentsText = this.segmentsChangeText(
            preData?.segments,
            data?.segments,
        );
        const strategySpecificText = [
            stickinessText,
            rolloutText,
            groupIdText,
            constraintText,
            segmentsText,
        ]
            .filter((txt) => txt.length)
            .join(';');
        return `by updating strategy ${this.bold(
            this.getStrategyTitle(event),
        )} in ${this.bold(environment)}${strategySpecificText}`;
    }

    private defaultStrategyChangeText(event: IEvent) {
        const { preData, data, environment } = event;
        const constraintText = this.constraintChangeText(
            preData?.constraints,
            data?.constraints,
        );
        const segmentsText = this.segmentsChangeText(
            preData?.segments,
            data?.segments,
        );
        const strategySpecificText = [constraintText, segmentsText]
            .filter((txt) => txt.length)
            .join(';');
        return `by updating strategy ${this.bold(
            this.getStrategyTitle(event),
        )} in ${this.bold(environment)}${strategySpecificText}`;
    }

    private constraintChangeText(
        oldConstraints: IConstraint[] = [],
        newConstraints: IConstraint[] = [],
    ) {
        const formatConstraints = (constraints: IConstraint[]) => {
            const constraintOperatorDescriptions = {
                IN: 'is one of',
                NOT_IN: 'is not one of',
                STR_CONTAINS: 'is a string that contains',
                STR_STARTS_WITH: 'is a string that starts with',
                STR_ENDS_WITH: 'is a string that ends with',
                NUM_EQ: 'is a number equal to',
                NUM_GT: 'is a number greater than',
                NUM_GTE: 'is a number greater than or equal to',
                NUM_LT: 'is a number less than',
                NUM_LTE: 'is a number less than or equal to',
                DATE_BEFORE: 'is a date before',
                DATE_AFTER: 'is a date after',
                SEMVER_EQ: 'is a SemVer equal to',
                SEMVER_GT: 'is a SemVer greater than',
                SEMVER_LT: 'is a SemVer less than',
            };
            const formatConstraint = (constraint: IConstraint) => {
                const val = constraint.hasOwnProperty('value')
                    ? constraint.value
                    : `(${constraint.values?.join(',')})`;
                const operator = constraintOperatorDescriptions.hasOwnProperty(
                    constraint.operator,
                )
                    ? constraintOperatorDescriptions[constraint.operator]
                    : constraint.operator;

                return `${constraint.contextName} ${
                    constraint.inverted ? 'not ' : ''
                }${operator} ${val}`;
            };

            return constraints.length === 0
                ? 'empty set of constraints'
                : `[${constraints.map(formatConstraint).join(', ')}]`;
        };
        const oldConstraintText = formatConstraints(oldConstraints);
        const newConstraintText = formatConstraints(newConstraints);
        return oldConstraintText === newConstraintText
            ? ''
            : ` constraints from ${oldConstraintText} to ${newConstraintText}`;
    }

    private segmentsChangeText(
        oldSegments: string[] = [],
        newSegments: string[] = [],
    ) {
        const formatSegments = (segments: string[]) => {
            return segments.length === 0
                ? 'empty set of segments'
                : `(${segments.join(',')})`;
        };
        const oldSegmentsText = formatSegments(oldSegments);
        const newSegmentsText = formatSegments(newSegments);

        return oldSegmentsText === newSegmentsText
            ? ''
            : ` segments from ${oldSegmentsText} to ${newSegmentsText}`;
    }

    format(event: IEvent): IFormattedEventData {
        const { createdBy, type } = event;
        const { label, action, path } = EVENT_MAP[type] || {
            label: type,
            action: `${this.bold(createdBy)} triggered ${this.bold(type)}`,
        };

        const formatting = {
            b: this.bold(),
        };

        const context = {
            user: createdBy,
            event,
            strategyTitle: this.getStrategyTitle(event),
            strategyChangeText: this.generateFeatureStrategyChangeText(event),
            changeRequest: this.generateChangeRequestLink(event),
            feature: this.generateFeatureLink(event),
            project: this.generateProjectLink(event),
            ...formatting,
        };

        Mustache.escape = (text) => text;

        const text = Mustache.render(action, context);
        const url = path
            ? `${this.unleashUrl}${Mustache.render(path, context)}`
            : undefined;

        return {
            label,
            text,
            url,
        };
    }
}
