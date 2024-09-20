import Mustache from 'mustache';
import {
    ADDON_CONFIG_CREATED,
    ADDON_CONFIG_DELETED,
    ADDON_CONFIG_UPDATED,
    API_TOKEN_CREATED,
    API_TOKEN_DELETED,
    CHANGE_ADDED,
    CHANGE_DISCARDED,
    CHANGE_EDITED,
    CHANGE_REQUEST_APPLIED,
    CHANGE_REQUEST_APPROVAL_ADDED,
    CHANGE_REQUEST_APPROVED,
    CHANGE_REQUEST_CANCELLED,
    CHANGE_REQUEST_CREATED,
    CHANGE_REQUEST_DISCARDED,
    CHANGE_REQUEST_REJECTED,
    CHANGE_REQUEST_SENT_TO_REVIEW,
    CONTEXT_FIELD_CREATED,
    CONTEXT_FIELD_DELETED,
    CONTEXT_FIELD_UPDATED,
    FEATURE_ARCHIVED,
    FEATURE_CREATED,
    FEATURE_DELETED,
    FEATURE_ENVIRONMENT_DISABLED,
    FEATURE_ENVIRONMENT_ENABLED,
    FEATURE_ENVIRONMENT_VARIANTS_UPDATED,
    FEATURE_METADATA_UPDATED,
    FEATURE_POTENTIALLY_STALE_ON,
    FEATURE_PROJECT_CHANGE,
    FEATURE_REVIVED,
    FEATURE_STALE_OFF,
    FEATURE_STALE_ON,
    FEATURE_STRATEGY_ADD,
    FEATURE_STRATEGY_REMOVE,
    FEATURE_STRATEGY_UPDATE,
    FEATURE_TAGGED,
    FEATURE_UNTAGGED,
    GROUP_CREATED,
    GROUP_DELETED,
    GROUP_UPDATED,
    type IConstraint,
    type IEvent,
    BANNER_CREATED,
    BANNER_DELETED,
    BANNER_UPDATED,
    PROJECT_CREATED,
    PROJECT_DELETED,
    SEGMENT_CREATED,
    SEGMENT_DELETED,
    SEGMENT_UPDATED,
    SERVICE_ACCOUNT_CREATED,
    SERVICE_ACCOUNT_DELETED,
    SERVICE_ACCOUNT_UPDATED,
    USER_CREATED,
    USER_DELETED,
    USER_UPDATED,
    CHANGE_REQUEST_SCHEDULED,
    CHANGE_REQUEST_SCHEDULED_APPLICATION_SUCCESS,
    CHANGE_REQUEST_SCHEDULED_APPLICATION_FAILURE,
    CHANGE_REQUEST_SCHEDULE_SUSPENDED,
    FEATURE_COMPLETED,
} from '../types';

interface IEventData {
    label: string;
    action: string;
    path?: string;
}

interface IFormattedEventData {
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

const bold = (text?: string) => (text ? `**${text}**` : '');

const EVENT_MAP: Record<string, IEventData> = {
    [ADDON_CONFIG_CREATED]: {
        label: 'Integration configuration created',
        action: `${bold('{{user}}')} created a new ${bold('{{event.data.provider}}')} integration configuration`,
        path: '/integrations',
    },
    [ADDON_CONFIG_DELETED]: {
        label: 'Integration configuration deleted',
        action: `${bold('{{user}}')} deleted a ${bold('{{event.preData.provider}}')} integration configuration`,
        path: '/integrations',
    },
    [ADDON_CONFIG_UPDATED]: {
        label: 'Integration configuration updated',
        action: `${bold('{{user}}')} updated a ${bold('{{event.preData.provider}}')} integration configuration`,
        path: '/integrations',
    },
    [API_TOKEN_CREATED]: {
        label: 'API token created',
        action: `${bold('{{user}}')} created API token ${bold('{{event.data.username}}')}`,
        path: '/admin/api',
    },
    [API_TOKEN_DELETED]: {
        label: 'API token deleted',
        action: `${bold('{{user}}')} deleted API token ${bold('{{event.preData.username}}')}`,
        path: '/admin/api',
    },
    [CHANGE_ADDED]: {
        label: 'Change added',
        action: `${bold('{{user}}')} added a change to change request {{changeRequest}}`,
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [CHANGE_DISCARDED]: {
        label: 'Change discarded',
        action: `${bold('{{user}}')} discarded a change in change request {{changeRequest}}`,
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [CHANGE_EDITED]: {
        label: 'Change edited',
        action: `${bold('{{user}}')} edited a change in change request {{changeRequest}}`,
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [CHANGE_REQUEST_APPLIED]: {
        label: 'Change request applied',
        action: `${bold('{{user}}')} applied change request {{changeRequest}}`,
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [CHANGE_REQUEST_APPROVAL_ADDED]: {
        label: 'Change request approval added',
        action: `${bold('{{user}}')} added an approval to change request {{changeRequest}}`,
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [CHANGE_REQUEST_APPROVED]: {
        label: 'Change request approved',
        action: `${bold('{{user}}')} approved change request {{changeRequest}}`,
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [CHANGE_REQUEST_CANCELLED]: {
        label: 'Change request cancelled',
        action: `${bold('{{user}}')} cancelled change request {{changeRequest}}`,
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [CHANGE_REQUEST_CREATED]: {
        label: 'Change request created',
        action: `${bold('{{user}}')} created change request {{changeRequest}}`,
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [CHANGE_REQUEST_DISCARDED]: {
        label: 'Change request discarded',
        action: `${bold('{{user}}')} discarded change request {{changeRequest}}`,
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [CHANGE_REQUEST_REJECTED]: {
        label: 'Change request rejected',
        action: `${bold('{{user}}')} rejected change request {{changeRequest}}`,
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [CHANGE_REQUEST_SENT_TO_REVIEW]: {
        label: 'Change request sent to review',
        action: `${bold('{{user}}')} sent to review change request {{changeRequest}}`,
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [CHANGE_REQUEST_SCHEDULED]: {
        label: 'Change request scheduled',
        action: `${bold('{{user}}')} scheduled change request {{changeRequest}} to be applied at {{event.data.scheduledDate}} in project ${bold('{{event.project}}')}`,
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [CHANGE_REQUEST_SCHEDULED_APPLICATION_SUCCESS]: {
        label: 'Scheduled change request applied successfully',
        action: `${bold('Successfully')} applied the scheduled change request {{changeRequest}} by ${bold('{{user}}')} in project ${bold('{{event.project}}')}.`,
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [CHANGE_REQUEST_SCHEDULED_APPLICATION_FAILURE]: {
        label: 'Scheduled change request failed',
        action: `${bold('Failed')} to apply the scheduled change request {{changeRequest}} by ${bold('{{user}}')} in project ${bold('{{event.project}}')}.`,
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [CHANGE_REQUEST_SCHEDULE_SUSPENDED]: {
        label: 'Change request suspended',
        action: `Change request {{changeRequest}} was suspended for the following reason: {{event.data.reason}}`,
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [CONTEXT_FIELD_CREATED]: {
        label: 'Context field created',
        action: `${bold('{{user}}')} created context field ${bold('{{event.data.name}}')}`,
        path: '/context',
    },
    [CONTEXT_FIELD_DELETED]: {
        label: 'Context field deleted',
        action: `${bold('{{user}}')} deleted context field ${bold('{{event.preData.name}}')}`,
        path: '/context',
    },
    [CONTEXT_FIELD_UPDATED]: {
        label: 'Context field updated',
        action: `${bold('{{user}}')} updated context field ${bold('{{event.preData.name}}')}`,
        path: '/context',
    },
    [FEATURE_ARCHIVED]: {
        label: 'Flag archived',
        action: `${bold('{{user}}')} archived ${bold('{{event.featureName}}')} in project ${bold('{{project}}')}`,
        path: '/projects/{{event.project}}/archive',
    },
    [FEATURE_CREATED]: {
        label: 'Flag created',
        action: `${bold('{{user}}')} created ${bold('{{feature}}')} in project ${bold('{{project}}')}`,
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [FEATURE_DELETED]: {
        label: 'Flag deleted',
        action: `${bold('{{user}}')} deleted ${bold('{{event.featureName}}')} in project ${bold('{{project}}')}`,
        path: '/projects/{{event.project}}',
    },
    [FEATURE_ENVIRONMENT_DISABLED]: {
        label: 'Flag disabled',
        action: `${bold('{{user}}')} disabled ${bold('{{feature}}')} for the ${bold('{{event.environment}}')} environment in project ${bold('{{project}}')}`,
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [FEATURE_ENVIRONMENT_ENABLED]: {
        label: 'Flag enabled',
        action: `${bold('{{user}}')} enabled ${bold('{{feature}}')} for the ${bold('{{event.environment}}')} environment in project ${bold('{{project}}')}`,
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [FEATURE_ENVIRONMENT_VARIANTS_UPDATED]: {
        label: 'Flag variants updated',
        action: `${bold('{{user}}')} updated variants for ${bold('{{feature}}')} for the ${bold('{{event.environment}}')} environment in project ${bold('{{project}}')}`,
        path: '/projects/{{event.project}}/features/{{event.featureName}}/variants',
    },
    [FEATURE_METADATA_UPDATED]: {
        label: 'Flag metadata updated',
        action: `${bold('{{user}}')} updated ${bold('{{feature}}')} metadata in project ${bold('{{project}}')}`,
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [FEATURE_COMPLETED]: {
        label: 'Flag marked as completed',
        action: `${bold('{{feature}}')} was marked as completed in project ${bold('{{project}}')}`,
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [FEATURE_POTENTIALLY_STALE_ON]: {
        label: 'Flag potentially stale',
        action: `${bold('{{feature}}')} was marked as potentially stale in project ${bold('{{project}}')}`,
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [FEATURE_PROJECT_CHANGE]: {
        label: 'Flag moved to a new project',
        action: `${bold('{{user}}')} moved ${bold('{{feature}}')} from ${bold('{{event.data.oldProject}}')} to ${bold('{{project}}')}`,
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [FEATURE_REVIVED]: {
        label: 'Flag revived',
        action: `${bold('{{user}}')} revived ${bold('{{feature}}')} in project ${bold('{{project}}')}`,
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [FEATURE_STALE_OFF]: {
        label: 'Flag stale marking removed',
        action: `${bold('{{user}}')} removed the stale marking on ${bold('{{feature}}')} in project ${bold('{{project}}')}`,
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [FEATURE_STALE_ON]: {
        label: 'Flag marked as stale',
        action: `${bold('{{user}}')} marked ${bold('{{feature}}')} as stale in project ${bold('{{project}}')}`,
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [FEATURE_STRATEGY_ADD]: {
        label: 'Flag strategy added',
        action: `${bold('{{user}}')} added strategy ${bold('{{strategyTitle}}')} to ${bold('{{feature}}')} for the ${bold('{{event.environment}}')} environment in project ${bold('{{project}}')}`,
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [FEATURE_STRATEGY_REMOVE]: {
        label: 'Flag strategy removed',
        action: `${bold('{{user}}')} removed strategy ${bold('{{strategyTitle}}')} from ${bold('{{feature}}')} for the ${bold('{{event.environment}}')} environment in project ${bold('{{project}}')}`,
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [FEATURE_STRATEGY_UPDATE]: {
        label: 'Flag strategy updated',
        action: `${bold('{{user}}')} updated ${bold('{{feature}}')} in project ${bold('{{project}}')} {{strategyChangeText}}`,
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [FEATURE_TAGGED]: {
        label: 'Flag tagged',
        action: `${bold('{{user}}')} tagged ${bold('{{feature}}')} with ${bold('{{event.data.type}}:{{event.data.value}}')} in project ${bold('{{project}}')}`,
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [FEATURE_UNTAGGED]: {
        label: 'Flag untagged',
        action: `${bold('{{user}}')} untagged ${bold('{{feature}}')} with ${bold('{{event.preData.type}}:{{event.preData.value}}')} in project ${bold('{{project}}')}`,
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [GROUP_CREATED]: {
        label: 'Group created',
        action: `${bold('{{user}}')} created group ${bold('{{event.data.name}}')}`,
        path: '/admin/groups',
    },
    [GROUP_DELETED]: {
        label: 'Group deleted',
        action: `${bold('{{user}}')} deleted group ${bold('{{event.preData.name}}')}`,
        path: '/admin/groups',
    },
    [GROUP_UPDATED]: {
        label: 'Group updated',
        action: `${bold('{{user}}')} updated group ${bold('{{event.preData.name}}')}`,
        path: '/admin/groups',
    },
    [BANNER_CREATED]: {
        label: 'Banner created',
        action: `${bold('{{user}}')} created banner ${bold('{{event.data.message}}')}`,
        path: '/admin/message-banners',
    },
    [BANNER_DELETED]: {
        label: 'Banner deleted',
        action: `${bold('{{user}}')} deleted banner ${bold('{{event.preData.message}}')}`,
        path: '/admin/message-banners',
    },
    [BANNER_UPDATED]: {
        label: 'Banner updated',
        action: `${bold('{{user}}')} updated banner ${bold('{{event.preData.message}}')}`,
        path: '/admin/message-banners',
    },
    [PROJECT_CREATED]: {
        label: 'Project created',
        action: `${bold('{{user}}')} created project ${bold('{{project}}')}`,
        path: '/projects',
    },
    [PROJECT_DELETED]: {
        label: 'Project deleted',
        action: `${bold('{{user}}')} deleted project ${bold('{{event.project}}')}`,
        path: '/projects',
    },
    [SEGMENT_CREATED]: {
        label: 'Segment created',
        action: `${bold('{{user}}')} created segment ${bold('{{event.data.name}}')}`,
        path: '/segments',
    },
    [SEGMENT_DELETED]: {
        label: 'Segment deleted',
        action: `${bold('{{user}}')} deleted segment ${bold('{{event.preData.name}}')}`,
        path: '/segments',
    },
    [SEGMENT_UPDATED]: {
        label: 'Segment updated',
        action: `${bold('{{user}}')} updated segment ${bold('{{event.preData.name}}')}`,
        path: '/segments',
    },
    [SERVICE_ACCOUNT_CREATED]: {
        label: 'Service account created',
        action: `${bold('{{user}}')} created service account ${bold('{{event.data.name}}')}`,
        path: '/admin/service-accounts',
    },
    [SERVICE_ACCOUNT_DELETED]: {
        label: 'Service account deleted',
        action: `${bold('{{user}}')} deleted service account ${bold('{{event.preData.name}}')}`,
        path: '/admin/service-accounts',
    },
    [SERVICE_ACCOUNT_UPDATED]: {
        label: 'Service account updated',
        action: `${bold('{{user}}')} updated service account ${bold('{{event.preData.name}}')}`,
        path: '/admin/service-accounts',
    },
    [USER_CREATED]: {
        label: 'User created',
        action: `${bold('{{user}}')} created user ${bold('{{event.data.name}}')}`,
        path: '/admin/users',
    },
    [USER_DELETED]: {
        label: 'User deleted',
        action: `${bold('{{user}}')} deleted user ${bold('{{event.preData.name}}')}`,
        path: '/admin/users',
    },
    [USER_UPDATED]: {
        label: 'User updated',
        action: `${bold('{{user}}')} updated user ${bold('{{event.preData.name}}')}`,
        path: '/admin/users',
    },
};

export class FeatureEventFormatterMd implements FeatureEventFormatter {
    private readonly unleashUrl: string;

    private readonly linkStyle: LinkStyle;

    constructor(unleashUrl: string, linkStyle: LinkStyle = LinkStyle.MD) {
        this.unleashUrl = unleashUrl;
        this.linkStyle = linkStyle;
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
                ? ` for feature flag ${bold(featureLink)}`
                : '';
            const environmentText = environment
                ? ` in the ${bold(environment)} environment`
                : '';
            const projectLink = this.generateProjectLink(event);
            const projectText = project
                ? ` in project ${bold(projectLink)}`
                : '';
            if (this.linkStyle === LinkStyle.SLACK) {
                return `${bold(`<${url}|${text}>`)}${featureText}${environmentText}${projectText}`;
            } else {
                return `${bold(`[${text}](${url})`)}${featureText}${environmentText}${projectText}`;
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
                    case 'userWithId':
                        return this.userWithIdStrategyChangeText(event);
                    case 'remoteAddress':
                        return this.remoteAddressStrategyChangeText(event);
                    case 'applicationHostname':
                        return this.applicationHostnameStrategyChangeText(
                            event,
                        );
                    default:
                        return `by updating strategy ${bold(
                            this.getStrategyTitle(event),
                        )} in ${bold(environment)}`;
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

    private userWithIdStrategyChangeText(event: IEvent) {
        return this.listOfValuesStrategyChangeText(event, 'userIds');
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
        return `by updating strategy ${bold(
            this.getStrategyTitle(event),
        )} in ${bold(environment)}${strategySpecificText}`;
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
        return `by updating strategy ${bold(
            this.getStrategyTitle(event),
        )} in ${bold(environment)}${strategySpecificText}`;
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
        return `by updating strategy ${bold(
            this.getStrategyTitle(event),
        )} in ${bold(environment)}${strategySpecificText}`;
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
        const { action, path } = EVENT_MAP[type] || {
            action: `triggered ${bold(type)}`,
        };

        const context = {
            user: createdBy,
            event,
            strategyTitle: this.getStrategyTitle(event),
            strategyChangeText: this.generateFeatureStrategyChangeText(event),
            changeRequest: this.generateChangeRequestLink(event),
            feature: this.generateFeatureLink(event),
            project: this.generateProjectLink(event),
        };

        Mustache.escape = (text) => text;

        const label = EVENT_MAP[type]?.label || type;
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
