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
    action: string;
    path?: string;
}

interface IFormattedEventData {
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

const EVENT_MAP: Record<string, IEventData> = {
    [ADDON_CONFIG_CREATED]: {
        action: '*{{user}}* created a new *{{event.data.provider}}* integration configuration',
        path: '/integrations',
    },
    [ADDON_CONFIG_DELETED]: {
        action: '*{{user}}* deleted a *{{event.preData.provider}}* integration configuration',
        path: '/integrations',
    },
    [ADDON_CONFIG_UPDATED]: {
        action: '*{{user}}* updated a *{{event.preData.provider}}* integration configuration',
        path: '/integrations',
    },
    [API_TOKEN_CREATED]: {
        action: '*{{user}}* created API token *{{event.data.username}}*',
        path: '/admin/api',
    },
    [API_TOKEN_DELETED]: {
        action: '*{{user}}* deleted API token *{{event.preData.username}}*',
        path: '/admin/api',
    },
    [CHANGE_ADDED]: {
        action: '*{{user}}* added a change to change request {{changeRequest}}',
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [CHANGE_DISCARDED]: {
        action: '*{{user}}* discarded a change in change request {{changeRequest}}',
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [CHANGE_EDITED]: {
        action: '*{{user}}* edited a change in change request {{changeRequest}}',
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [CHANGE_REQUEST_APPLIED]: {
        action: '*{{user}}* applied change request {{changeRequest}}',
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [CHANGE_REQUEST_APPROVAL_ADDED]: {
        action: '*{{user}}* added an approval to change request {{changeRequest}}',
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [CHANGE_REQUEST_APPROVED]: {
        action: '*{{user}}* approved change request {{changeRequest}}',
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [CHANGE_REQUEST_CANCELLED]: {
        action: '*{{user}}* cancelled change request {{changeRequest}}',
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [CHANGE_REQUEST_CREATED]: {
        action: '*{{user}}* created change request {{changeRequest}}',
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [CHANGE_REQUEST_DISCARDED]: {
        action: '*{{user}}* discarded change request {{changeRequest}}',
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [CHANGE_REQUEST_REJECTED]: {
        action: '*{{user}}* rejected change request {{changeRequest}}',
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [CHANGE_REQUEST_SENT_TO_REVIEW]: {
        action: '*{{user}}* sent to review change request {{changeRequest}}',
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [CHANGE_REQUEST_SCHEDULED]: {
        action: '*{{user}}* scheduled change request {{changeRequest}} to be applied at {{event.data.scheduledDate}} in project *{{event.project}}*',
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [CHANGE_REQUEST_SCHEDULED_APPLICATION_SUCCESS]: {
        action: '*Successfully* applied the scheduled change request {{changeRequest}} by *{{user}}* in project *{{event.project}}*.',
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [CHANGE_REQUEST_SCHEDULED_APPLICATION_FAILURE]: {
        action: '*Failed* to apply the scheduled change request {{changeRequest}} by *{{user}}* in project *{{event.project}}*.',
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [CHANGE_REQUEST_SCHEDULE_SUSPENDED]: {
        action: 'Change request {{changeRequest}} was suspended for the following reason: {{event.data.reason}}',
        path: '/projects/{{event.project}}/change-requests/{{event.data.changeRequestId}}',
    },
    [CONTEXT_FIELD_CREATED]: {
        action: '*{{user}}* created context field *{{event.data.name}}*',
        path: '/context',
    },
    [CONTEXT_FIELD_DELETED]: {
        action: '*{{user}}* deleted context field *{{event.preData.name}}*',
        path: '/context',
    },
    [CONTEXT_FIELD_UPDATED]: {
        action: '*{{user}}* updated context field *{{event.preData.name}}*',
        path: '/context',
    },
    [FEATURE_ARCHIVED]: {
        action: '*{{user}}* archived *{{event.featureName}}* in project *{{project}}*',
        path: '/projects/{{event.project}}/archive',
    },
    [FEATURE_CREATED]: {
        action: '*{{user}}* created *{{feature}}* in project *{{project}}*',
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [FEATURE_DELETED]: {
        action: '*{{user}}* deleted *{{event.featureName}}* in project *{{project}}*',
        path: '/projects/{{event.project}}',
    },
    [FEATURE_ENVIRONMENT_DISABLED]: {
        action: '*{{user}}* disabled *{{feature}}* for the *{{event.environment}}* environment in project *{{project}}*',
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [FEATURE_ENVIRONMENT_ENABLED]: {
        action: '*{{user}}* enabled *{{feature}}* for the *{{event.environment}}* environment in project *{{project}}*',
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [FEATURE_ENVIRONMENT_VARIANTS_UPDATED]: {
        action: '*{{user}}* updated variants for *{{feature}}* for the *{{event.environment}}* environment in project *{{project}}*',
        path: '/projects/{{event.project}}/features/{{event.featureName}}/variants',
    },
    [FEATURE_METADATA_UPDATED]: {
        action: '*{{user}}* updated *{{feature}}* metadata in project *{{project}}*',
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [FEATURE_COMPLETED]: {
        action: '*{{feature}}* was marked as completed in project *{{project}}*',
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [FEATURE_POTENTIALLY_STALE_ON]: {
        action: '*{{feature}}* was marked as potentially stale in project *{{project}}*',
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [FEATURE_PROJECT_CHANGE]: {
        action: '*{{user}}* moved *{{feature}}* from *{{event.data.oldProject}}* to *{{project}}*',
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [FEATURE_REVIVED]: {
        action: '*{{user}}* revived *{{feature}}* in project *{{project}}*',
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [FEATURE_STALE_OFF]: {
        action: '*{{user}}* removed the stale marking on *{{feature}}* in project *{{project}}*',
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [FEATURE_STALE_ON]: {
        action: '*{{user}}* marked *{{feature}}* as stale in project *{{project}}*',
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [FEATURE_STRATEGY_ADD]: {
        action: '*{{user}}* added strategy *{{strategyTitle}}* to *{{feature}}* for the *{{event.environment}}* environment in project *{{project}}*',
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [FEATURE_STRATEGY_REMOVE]: {
        action: '*{{user}}* removed strategy *{{strategyTitle}}* from *{{feature}}* for the *{{event.environment}}* environment in project *{{project}}*',
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [FEATURE_STRATEGY_UPDATE]: {
        action: '*{{user}}* updated *{{feature}}* in project *{{project}}* {{strategyChangeText}}',
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [FEATURE_TAGGED]: {
        action: '*{{user}}* tagged *{{feature}}* with *{{event.data.type}}:{{event.data.value}}* in project *{{project}}*',
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [FEATURE_UNTAGGED]: {
        action: '*{{user}}* untagged *{{feature}}* with *{{event.preData.type}}:{{event.preData.value}}* in project *{{project}}*',
        path: '/projects/{{event.project}}/features/{{event.featureName}}',
    },
    [GROUP_CREATED]: {
        action: '*{{user}}* created group *{{event.data.name}}*',
        path: '/admin/groups',
    },
    [GROUP_DELETED]: {
        action: '*{{user}}* deleted group *{{event.preData.name}}*',
        path: '/admin/groups',
    },
    [GROUP_UPDATED]: {
        action: '*{{user}}* updated group *{{event.preData.name}}*',
        path: '/admin/groups',
    },
    [BANNER_CREATED]: {
        action: '*{{user}}* created banner *{{event.data.message}}*',
        path: '/admin/message-banners',
    },
    [BANNER_DELETED]: {
        action: '*{{user}}* deleted banner *{{event.preData.message}}*',
        path: '/admin/message-banners',
    },
    [BANNER_UPDATED]: {
        action: '*{{user}}* updated banner *{{event.preData.message}}*',
        path: '/admin/message-banners',
    },
    [PROJECT_CREATED]: {
        action: '*{{user}}* created project *{{project}}*',
        path: '/projects',
    },
    [PROJECT_DELETED]: {
        action: '*{{user}}* deleted project *{{event.project}}*',
        path: '/projects',
    },
    [SEGMENT_CREATED]: {
        action: '*{{user}}* created segment *{{event.data.name}}*',
        path: '/segments',
    },
    [SEGMENT_DELETED]: {
        action: '*{{user}}* deleted segment *{{event.preData.name}}*',
        path: '/segments',
    },
    [SEGMENT_UPDATED]: {
        action: '*{{user}}* updated segment *{{event.preData.name}}*',
        path: '/segments',
    },
    [SERVICE_ACCOUNT_CREATED]: {
        action: '*{{user}}* created service account *{{event.data.name}}*',
        path: '/admin/service-accounts',
    },
    [SERVICE_ACCOUNT_DELETED]: {
        action: '*{{user}}* deleted service account *{{event.preData.name}}*',
        path: '/admin/service-accounts',
    },
    [SERVICE_ACCOUNT_UPDATED]: {
        action: '*{{user}}* updated service account *{{event.preData.name}}*',
        path: '/admin/service-accounts',
    },
    [USER_CREATED]: {
        action: '*{{user}}* created user *{{event.data.name}}*',
        path: '/admin/users',
    },
    [USER_DELETED]: {
        action: '*{{user}}* deleted user *{{event.preData.name}}*',
        path: '/admin/users',
    },
    [USER_UPDATED]: {
        action: '*{{user}}* updated user *{{event.preData.name}}*',
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
                ? ` for feature flag *${featureLink}*`
                : '';
            const environmentText = environment
                ? ` in the *${environment}* environment`
                : '';
            const projectLink = this.generateProjectLink(event);
            const projectText = project ? ` in project *${projectLink}*` : '';
            if (this.linkStyle === LinkStyle.SLACK) {
                return `*<${url}|${text}>*${featureText}${environmentText}${projectText}`;
            } else {
                return `*[${text}](${url})*${featureText}${environmentText}${projectText}`;
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
                        return `by updating strategy *${this.getStrategyTitle(
                            event,
                        )}* in *${environment}*`;
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
        return `by updating strategy *${this.getStrategyTitle(
            event,
        )}* in *${environment}*${strategySpecificText}`;
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
        return `by updating strategy *${this.getStrategyTitle(
            event,
        )}* in *${environment}*${strategySpecificText}`;
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
        return `by updating strategy *${this.getStrategyTitle(
            event,
        )}* in *${environment}*${strategySpecificText}`;
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

    format(event: IEvent): {
        text: string;
        url?: string;
    } {
        const { createdBy, type } = event;
        const { action, path } = EVENT_MAP[type] || {
            action: `triggered *${type}*`,
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

        const text = Mustache.render(action, context);
        const url = path
            ? `${this.unleashUrl}${Mustache.render(path, context)}`
            : undefined;

        return {
            text,
            url,
        };
    }
}
