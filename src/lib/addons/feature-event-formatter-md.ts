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
    FEATURE_VARIANTS_UPDATED,
    IConstraint,
    IEvent,
} from '../types';

export interface FeatureEventFormatter {
    format: (event: IEvent) => string;
    featureLink: (event: IEvent) => string;
}

export enum LinkStyle {
    SLACK,
    MD,
}

export class FeatureEventFormatterMd implements FeatureEventFormatter {
    private readonly unleashUrl: string;

    private readonly linkStyle: LinkStyle;

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
            return `<${this.featureLink(event)}|${event.featureName}>`;
        } else {
            return `[${event.featureName}](${this.featureLink(event)})`;
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
                const val = constraint.hasOwnProperty('value')
                    ? constraint.value
                    : `(${constraint.values.join(',')})`;
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

    generateStrategyRemoveText(event: IEvent): string {
        const { createdBy, environment, project, preData } = event;
        const feature = this.generateFeatureLink(event);
        return `${createdBy} updated *${feature}* in project *${project}* by removing strategy ${preData?.name} in *${environment}*`;
    }

    generateStrategyAddText(event: IEvent): string {
        const { createdBy, environment, project, data } = event;
        const feature = this.generateFeatureLink(event);
        return `${createdBy} updated *${feature}* in project *${project}* by adding strategy ${data?.name} in *${environment}*`;
    }

    generateMetadataText(event: IEvent): string {
        const { createdBy, project } = event;
        const feature = this.generateFeatureLink(event);
        return `${createdBy} updated the metadata for ${feature} in project *${project}*`;
    }

    generateProjectChangeText(event: IEvent): string {
        const { createdBy, project, featureName } = event;
        return `${createdBy} moved ${featureName} to ${project}`;
    }

    featureLink(event: IEvent): string {
        const { type, project = '', featureName } = event;
        if (type === FEATURE_ARCHIVED) {
            if (project) {
                return `${this.unleashUrl}/projects/${project}/archive`;
            }
            return `${this.unleashUrl}/archive`;
        }

        return `${this.unleashUrl}/projects/${project}/features/${featureName}`;
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
            case FEATURE_STRATEGY_REMOVE:
                return this.generateStrategyRemoveText(event);
            case FEATURE_STRATEGY_ADD:
                return this.generateStrategyAddText(event);
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
