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
    FEATURE_UPDATED,
    FEATURE_VARIANTS_UPDATED,
    GROUP_CREATED,
    GROUP_DELETED,
    GROUP_UPDATED,
    IConstraint,
    IEvent,
    ITag,
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
} from '../types';

export interface FeatureEventFormatter {
    format: (event: IEvent) => string;
    featureLink: (event: IEvent) => string | undefined;
}
export enum LinkStyle {
    SLACK = 0,
    MD = 1,
}

export class FeatureEventFormatterMd implements FeatureEventFormatter {
    private readonly unleashUrl: string;

    private readonly linkStyle: LinkStyle;

    constructor(unleashUrl: string, linkStyle: LinkStyle = LinkStyle.MD) {
        this.unleashUrl = unleashUrl;
        this.linkStyle = linkStyle;
    }

    generateFeatureArchivedText(event: IEvent): string {
        const { createdBy, type, project } = event;
        const action = type === FEATURE_ARCHIVED ? 'archived' : 'revived';
        const feature = this.generateFeatureLink(event);
        return ` ${createdBy} just *${action}* feature toggle *${feature}* in project *${project}*`;
    }

    generateFeatureDeletedText(event: IEvent): string {
        const { createdBy, project } = event;
        const feature = this.generateFeatureLink(event);
        return ` ${createdBy} *deleted* feature toggle *${feature}* in project *${project}*`;
    }

    generateFeatureTaggedOrUntaggedText(event: IEvent): string {
        const { createdBy, project, type, data } = event;
        const action = type === FEATURE_TAGGED ? 'tagged' : 'untagged';
        const feature = this.generateFeatureLink(event);
        const tag = data as ITag;
        return `${createdBy} *${action}* *${tag.type}:${tag.value}* in feature toggle *${feature}* in project *${project}*`;
    }

    generateChangeRequestText(event: IEvent): string {
        const { createdBy, environment, type, data } = event;
        const action =
            type === CHANGE_REQUEST_CREATED
                ? 'created'
                : type === CHANGE_REQUEST_DISCARDED
                ? 'discarded'
                : type === CHANGE_REQUEST_CANCELLED
                ? 'cancelled'
                : type === CHANGE_REQUEST_REJECTED
                ? 'rejected'
                : type === CHANGE_REQUEST_SENT_TO_REVIEW
                ? 'sent to review'
                : type === CHANGE_REQUEST_APPROVAL_ADDED
                ? 'added approval'
                : type === CHANGE_REQUEST_APPROVED
                ? 'approved'
                : 'applied';
        const feature = this.generateFeatureLink(event);
        return `${createdBy} *${action}* change request #${data.changeRequestId} for feature toggle *${feature}* in *${environment}* environment in project *${data.project}*`;
    }

    generateChangeAddedOrEditedOrDiscardedText(event: IEvent): string {
        const { createdBy, environment, project, type, data } = event;
        const action =
            type === CHANGE_ADDED
                ? 'added'
                : type === CHANGE_EDITED
                ? 'edited'
                : 'discarded';
        const feature = this.generateFeatureLink(event);
        return `${createdBy} *${action}* a change in change request #${data.changeRequestId} for feature toggle *${feature}* in *${environment}* environment in project *${project}*`;
    }

    generateProjectCreatedOrDeletedText(event: IEvent): string {
        const { createdBy, type, project } = event;
        const action = type === PROJECT_CREATED ? 'created' : 'deleted';
        return `${createdBy} *${action}* project *${project}*`;
    }

    generateApiTokenCreatedOrDeletedText(event: IEvent): string {
        const { createdBy, type, preData, data } = event;
        const action = type === API_TOKEN_CREATED ? 'created' : 'deleted';
        return `${createdBy} *${action}* API token *${
            (data || preData).username
        }*`;
    }

    generateAddonConfigCreatedOrUpdatedOrDeletedText(event: IEvent): string {
        const { createdBy, type, data } = event;
        const action =
            type === ADDON_CONFIG_CREATED
                ? 'created'
                : type === ADDON_CONFIG_UPDATED
                ? 'updated'
                : 'deleted';
        return `${createdBy} *${action}* integration *${data.name}*`;
    }

    generateContextFieldCreatedOrUpdatedOrDeletedText(event: IEvent): string {
        const { createdBy, type, data } = event;
        const action =
            type === CONTEXT_FIELD_CREATED
                ? 'created'
                : type === CONTEXT_FIELD_UPDATED
                ? 'updated'
                : 'deleted';
        return `${createdBy} *${action}* context field *${data.name}*`;
    }

    generateSegmentCreatedOrUpdatedOrDeletedText(event: IEvent): string {
        const { createdBy, type, data } = event;
        const action =
            type === SEGMENT_CREATED
                ? 'created'
                : type === SEGMENT_UPDATED
                ? 'updated'
                : 'deleted';
        return `${createdBy} *${action}* segment *${data.name}*`;
    }

    generateUserCreatedOrUpdatedOrDeletedText(event: IEvent): string {
        const { createdBy, type, data } = event;
        const action =
            type === USER_CREATED
                ? 'created'
                : type === USER_UPDATED
                ? 'updated'
                : 'deleted';
        return `${createdBy} *${action}* user *${data.email}*`;
    }

    generateGroupCreatedOrUpdatedOrDeletedText(event: IEvent): string {
        const { createdBy, type, data } = event;
        const action =
            type === GROUP_CREATED
                ? 'created'
                : type === GROUP_UPDATED
                ? 'updated'
                : 'deleted';
        return `${createdBy} *${action}* group *${data.name}*`;
    }

    generateServiceAccountCreatedOrUpdatedOrDeletedText(event: IEvent): string {
        const { createdBy, type, data } = event;
        const action =
            type === SERVICE_ACCOUNT_CREATED
                ? 'created'
                : type === SERVICE_ACCOUNT_UPDATED
                ? 'updated'
                : 'deleted';
        return `${createdBy} *${action}* service account *${data.username}*`;
    }

    generateFeatureLink(event: IEvent): string {
        if (this.linkStyle === LinkStyle.SLACK) {
            return `<${this.featureLink(event)}|${event.featureName}>`;
        } else {
            return `[${event.featureName}](${this.featureLink(event)})`;
        }
    }

    generateFeatureStaleText(event: IEvent): string {
        const { createdBy, type } = event;
        const isStale = type === FEATURE_STALE_ON;
        const feature = this.generateFeatureLink(event);

        if (isStale) {
            return `${createdBy} marked ${feature} as stale and this feature toggle is now *ready to be removed* from the code.`;
        }
        return `${createdBy} removed the stale marking on *${feature}*.`;
    }

    generateFeatureEnvironmentToggleText(event: IEvent): string {
        const { createdBy, environment, type, project } = event;
        const toggleStatus =
            type === FEATURE_ENVIRONMENT_ENABLED ? 'enabled' : 'disabled';
        const feature = this.generateFeatureLink(event);
        return `${createdBy} *${toggleStatus}* ${feature} in *${environment}* environment in project *${project}*`;
    }

    generateFeatureStrategyChangeText(event: IEvent): string {
        const { createdBy, environment, project, data, preData } = event;
        const feature = this.generateFeatureLink(event);
        const strategyText = () => {
            switch (data.name) {
                case 'flexibleRollout':
                    return this.flexibleRolloutStrategyChangeText(
                        preData,
                        data,
                        environment,
                    );
                case 'default':
                    return this.defaultStrategyChangeText(
                        preData,
                        data,
                        environment,
                    );
                case 'userWithId':
                    return this.userWithIdStrategyChangeText(
                        preData,
                        data,
                        environment,
                    );
                case 'remoteAddress':
                    return this.remoteAddressStrategyChangeText(
                        preData,
                        data,
                        environment,
                    );
                case 'applicationHostname':
                    return this.applicationHostnameStrategyChangeText(
                        preData,
                        data,
                        environment,
                    );
                default:
                    return `by updating strategy ${data?.name} in *${environment}*`;
            }
        };

        return `${createdBy} updated *${feature}* in project *${project}* ${strategyText()}`;
    }

    private applicationHostnameStrategyChangeText(
        preData,
        data,
        environment: string | undefined,
    ) {
        return this.listOfValuesStrategyChangeText(
            preData,
            data,
            environment,
            'hostNames',
        );
    }

    private remoteAddressStrategyChangeText(
        preData,
        data,
        environment: string | undefined,
    ) {
        return this.listOfValuesStrategyChangeText(
            preData,
            data,
            environment,
            'IPs',
        );
    }

    private userWithIdStrategyChangeText(
        preData,
        data,
        environment: string | undefined,
    ) {
        return this.listOfValuesStrategyChangeText(
            preData,
            data,
            environment,
            'userIds',
        );
    }

    private listOfValuesStrategyChangeText(
        preData,
        data,
        environment: string | undefined,
        propertyName: string,
    ) {
        const userIdText = (values) =>
            values.length === 0
                ? `empty set of ${propertyName}`
                : `[${values}]`;
        const usersText =
            preData.parameters[propertyName] === data.parameters[propertyName]
                ? ''
                : ` ${propertyName} from ${userIdText(
                      preData.parameters[propertyName],
                  )} to ${userIdText(data.parameters[propertyName])}`;
        const constraintText = this.constraintChangeText(
            preData.constraints,
            data.constraints,
        );
        const strategySpecificText = [usersText, constraintText]
            .filter((x) => x.length)
            .join(';');
        return `by updating strategy ${data?.name} in *${environment}*${strategySpecificText}`;
    }

    private flexibleRolloutStrategyChangeText(
        preData,
        data,
        environment: string | undefined,
    ) {
        const {
            rollout: oldRollout,
            stickiness: oldStickiness,
            groupId: oldGroupId,
        } = preData.parameters;
        const { rollout, stickiness, groupId } = data.parameters;
        const stickinessText =
            oldStickiness === stickiness
                ? ''
                : ` stickiness from ${oldStickiness} to ${stickiness}`;
        const rolloutText =
            oldRollout === rollout
                ? ''
                : ` rollout from ${oldRollout}% to ${rollout}%`;
        const groupIdText =
            oldGroupId === groupId
                ? ''
                : ` groupId from ${oldGroupId} to ${groupId}`;
        const constraintText = this.constraintChangeText(
            preData.constraints,
            data.constraints,
        );
        const strategySpecificText = [
            stickinessText,
            rolloutText,
            groupIdText,
            constraintText,
        ]
            .filter((txt) => txt.length)
            .join(';');
        return `by updating strategy ${data?.name} in *${environment}*${strategySpecificText}`;
    }

    private defaultStrategyChangeText(
        preData,
        data,
        environment: string | undefined,
    ) {
        return `by updating strategy ${
            data?.name
        } in *${environment}*${this.constraintChangeText(
            preData.constraints,
            data.constraints,
        )}`;
    }

    private constraintChangeText(
        oldConstraints: IConstraint[],
        newConstraints: IConstraint[],
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
                const val = Object.hasOwn(constraint, 'value')
                    ? constraint.value
                    : `(${constraint.values.join(',')})`;
                const operator = Object.hasOwn(
                    constraintOperatorDescriptions,
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

    generateFeatureStrategyRemoveText(event: IEvent): string {
        const { createdBy, environment, project, preData } = event;
        const feature = this.generateFeatureLink(event);
        return `${createdBy} updated *${feature}* in project *${project}* by removing strategy ${preData?.name} in *${environment}*`;
    }

    generateFeatureStrategyAddText(event: IEvent): string {
        const { createdBy, environment, project, data } = event;
        const feature = this.generateFeatureLink(event);
        return `${createdBy} updated *${feature}* in project *${project}* by adding strategy ${data?.name} in *${environment}*`;
    }

    generateFeatureMetadataText(event: IEvent): string {
        const { createdBy, project } = event;
        const feature = this.generateFeatureLink(event);
        return `${createdBy} updated the metadata for ${feature} in project *${project}*`;
    }

    generateFeatureProjectChangeText(event: IEvent): string {
        const { createdBy, project, featureName } = event;
        return `${createdBy} moved ${featureName} to ${project}`;
    }

    generateFeaturePotentiallyStaleOnText(event: IEvent): string {
        const { project, createdBy } = event;
        const feature = this.generateFeatureLink(event);

        return `${createdBy} marked feature toggle *${feature}* (in project *${project}*) as *potentially stale*.`;
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

    getAction(type: string): string {
        switch (type) {
            case FEATURE_CREATED:
                return 'created';
            case FEATURE_UPDATED:
                return 'updated';
            case FEATURE_VARIANTS_UPDATED:
                return 'updated variants for';
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

    // TODO: refactor so this returns both text and url?
    format(event: IEvent): string {
        switch (event.type) {
            case FEATURE_ARCHIVED:
            case FEATURE_REVIVED:
                return this.generateFeatureArchivedText(event);
            case FEATURE_STALE_ON:
            case FEATURE_STALE_OFF:
                return this.generateFeatureStaleText(event);
            case FEATURE_ENVIRONMENT_DISABLED:
            case FEATURE_ENVIRONMENT_ENABLED:
                return this.generateFeatureEnvironmentToggleText(event);
            case FEATURE_STRATEGY_REMOVE:
                return this.generateFeatureStrategyRemoveText(event);
            case FEATURE_STRATEGY_ADD:
                return this.generateFeatureStrategyAddText(event);
            case FEATURE_STRATEGY_UPDATE:
                return this.generateFeatureStrategyChangeText(event);
            case FEATURE_METADATA_UPDATED:
                return this.generateFeatureMetadataText(event);
            case FEATURE_PROJECT_CHANGE:
                return this.generateFeatureProjectChangeText(event);
            case FEATURE_POTENTIALLY_STALE_ON:
                return this.generateFeaturePotentiallyStaleOnText(event);
            case FEATURE_DELETED:
                return this.generateFeatureDeletedText(event);
            case FEATURE_TAGGED:
            case FEATURE_UNTAGGED:
                return this.generateFeatureTaggedOrUntaggedText(event);
            case CHANGE_REQUEST_CREATED:
            case CHANGE_REQUEST_DISCARDED:
            case CHANGE_REQUEST_CANCELLED:
            case CHANGE_REQUEST_REJECTED:
            case CHANGE_REQUEST_SENT_TO_REVIEW:
            case CHANGE_REQUEST_APPROVAL_ADDED:
            case CHANGE_REQUEST_APPROVED:
            case CHANGE_REQUEST_APPLIED:
                return this.generateChangeRequestText(event);
            case CHANGE_ADDED:
            case CHANGE_EDITED:
            case CHANGE_DISCARDED:
                return this.generateChangeAddedOrEditedOrDiscardedText(event);
            case PROJECT_CREATED:
            case PROJECT_DELETED:
                return this.generateProjectCreatedOrDeletedText(event);
            case API_TOKEN_CREATED:
            case API_TOKEN_DELETED:
                return this.generateApiTokenCreatedOrDeletedText(event);
            case ADDON_CONFIG_CREATED:
            case ADDON_CONFIG_UPDATED:
            case ADDON_CONFIG_DELETED:
                return this.generateAddonConfigCreatedOrUpdatedOrDeletedText(
                    event,
                );
            case CONTEXT_FIELD_CREATED:
            case CONTEXT_FIELD_UPDATED:
            case CONTEXT_FIELD_DELETED:
                return this.generateContextFieldCreatedOrUpdatedOrDeletedText(
                    event,
                );
            case SEGMENT_CREATED:
            case SEGMENT_UPDATED:
            case SEGMENT_DELETED:
                return this.generateSegmentCreatedOrUpdatedOrDeletedText(event);
            case USER_CREATED:
            case USER_UPDATED:
            case USER_DELETED:
                return this.generateUserCreatedOrUpdatedOrDeletedText(event);
            case GROUP_CREATED:
            case GROUP_UPDATED:
            case GROUP_DELETED:
                return this.generateGroupCreatedOrUpdatedOrDeletedText(event);
            case SERVICE_ACCOUNT_CREATED:
            case SERVICE_ACCOUNT_UPDATED:
            case SERVICE_ACCOUNT_DELETED:
                return this.generateServiceAccountCreatedOrUpdatedOrDeletedText(
                    event,
                );
            default:
                return this.defaultText(event);
        }
    }
}
