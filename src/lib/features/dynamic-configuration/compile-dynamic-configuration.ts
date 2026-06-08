import type {
    CompiledDynamicConfiguration,
    CompiledDynamicConfigurationPayload,
    DynamicConfiguration,
    DynamicConfigurationType,
    DynamicConfigurationValue,
} from './dynamic-configuration-types.js';
import type { IConstraint, Operator } from '../../types/model.js';

const payloadType = (
    type: DynamicConfigurationType,
): CompiledDynamicConfigurationPayload['type'] => {
    if (type === 'number' || type === 'json') {
        return type;
    }
    return 'string';
};

const serializeValue = (
    type: DynamicConfigurationType,
    value: DynamicConfigurationValue,
): string => {
    if (type === 'json') {
        return JSON.stringify(value);
    }
    return String(value);
};

const payload = (
    type: DynamicConfigurationType,
    value: DynamicConfigurationValue,
): CompiledDynamicConfigurationPayload => ({
    type: payloadType(type),
    value: serializeValue(type, value),
});

const contextName = (name: string): string => {
    switch (name) {
        case 'appName':
            return 'app_name';
        case 'userId':
            return 'user_id';
        case 'sessionId':
            return 'session_id';
        case 'remoteAddress':
            return 'remote_address';
        case 'currentTime':
            return 'current_time';
        case 'environment':
            return 'environment';
        default:
            return `context[${JSON.stringify(name)}]`;
    }
};

const operator = (value: Operator, caseInsensitive = false): string => {
    switch (value) {
        case 'IN':
            return 'in';
        case 'NOT_IN':
            return 'not_in';
        case 'STR_ENDS_WITH':
            return caseInsensitive
                ? 'ends_with_any_ignore_case'
                : 'ends_with_any';
        case 'STR_STARTS_WITH':
            return caseInsensitive
                ? 'starts_with_any_ignore_case'
                : 'starts_with_any';
        case 'STR_CONTAINS':
            return caseInsensitive
                ? 'contains_any_ignore_case'
                : 'contains_any';
        case 'NUM_EQ':
        case 'SEMVER_EQ':
            return '==';
        case 'NUM_GT':
        case 'DATE_AFTER':
        case 'SEMVER_GT':
            return '>';
        case 'NUM_GTE':
            return '>=';
        case 'NUM_LT':
        case 'DATE_BEFORE':
        case 'SEMVER_LT':
            return '<';
        case 'NUM_LTE':
            return '<=';
        case 'REGEX':
            return caseInsensitive
                ? 'matches_regex_ignoring_case'
                : 'matches_regex';
    }
};

const constraintValue = (constraint: IConstraint): string => {
    if (constraint.values) {
        return `[${constraint.values
            .map((item) => JSON.stringify(item))
            .join(', ')}]`;
    }
    if (constraint.operator === 'REGEX') {
        return JSON.stringify(constraint.value ?? '');
    }
    return constraint.value ?? '';
};

const toExpression = (
    constraints: DynamicConfiguration['environments'][string]['overrides'][number]['constraints'],
) =>
    constraints.length === 0
        ? 'true'
        : constraints
              .map((constraint) =>
                  `${constraint.inverted ? '!' : ''}${contextName(
                      constraint.contextName,
                  )} ${operator(
                      constraint.operator,
                      constraint.caseInsensitive,
                  )} ${constraintValue(constraint)}`.trim(),
              )
              .join(' and ');

export const compileDynamicConfiguration = (
    configuration: DynamicConfiguration,
    environment: string,
): CompiledDynamicConfiguration | undefined => {
    const environmentConfiguration = configuration.environments[environment];
    if (!environmentConfiguration) {
        return undefined;
    }

    const versionNumbers = configuration.versions.map(({ version }) => version);
    const availableVersions = new Set(versionNumbers);
    if (availableVersions.size !== versionNumbers.length) {
        throw new Error(
            `Dynamic configuration ${configuration.key} contains duplicate versions`,
        );
    }

    const referencedVersions = [
        environmentConfiguration.defaultVersion,
        ...environmentConfiguration.overrides.map(({ version }) => version),
    ];
    const missingVersion = referencedVersions.find(
        (version) => !availableVersions.has(version),
    );
    if (missingVersion !== undefined) {
        throw new Error(
            `Dynamic configuration ${configuration.key} references missing version ${missingVersion}`,
        );
    }

    const targetedRules = [...environmentConfiguration.overrides]
        .sort((left, right) => left.priority - right.priority)
        .map((override) => ({
            expression: toExpression(override.constraints),
            version: override.version,
        }));

    return {
        name: configuration.key,
        project: configuration.project,
        type: configuration.type,
        versions: configuration.versions.map((version) => ({
            version: version.version,
            payload: payload(configuration.type, version.value),
        })),
        rules: [
            ...targetedRules,
            {
                expression: 'true',
                version: environmentConfiguration.defaultVersion,
            },
        ],
    };
};
