import { Variant, PayloadType } from 'unleash-client';
import { parseEnvVarBoolean } from '../util';
import { getDefaultVariant } from 'unleash-client/lib/variant';

export type IFlagKey =
    | 'anonymiseEventLog'
    | 'embedProxy'
    | 'embedProxyFrontend'
    | 'responseTimeWithAppNameKillSwitch'
    | 'maintenanceMode'
    | 'messageBanner'
    | 'featuresExportImport'
    | 'caseInsensitiveInOperators'
    | 'strictSchemaValidation'
    | 'proPlanAutoCharge'
    | 'personalAccessTokensKillSwitch'
    | 'migrationLock'
    | 'demo'
    | 'googleAuthEnabled'
    | 'disableBulkToggle'
    | 'disableNotifications'
    | 'advancedPlayground'
    | 'strategyVariant'
    | 'slackAppAddon'
    | 'filterInvalidClientMetrics'
    | 'lastSeenByEnvironment'
    | 'segmentChangeRequests'
    | 'changeRequestReject'
    | 'customRootRolesKillSwitch'
    | 'newApplicationList'
    | 'integrationsRework'
    | 'multipleRoles'
    | 'featureNamingPattern';

export type IFlags = Partial<{ [key in IFlagKey]: boolean | Variant }>;

const flags: IFlags = {
    anonymiseEventLog: false,
    embedProxy: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_EMBED_PROXY,
        true,
    ),
    embedProxyFrontend: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_EMBED_PROXY_FRONTEND,
        true,
    ),
    responseTimeWithAppNameKillSwitch: parseEnvVarBoolean(
        process.env.UNLEASH_RESPONSE_TIME_WITH_APP_NAME_KILL_SWITCH,
        false,
    ),
    maintenanceMode: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_MAINTENANCE_MODE,
        false,
    ),
    messageBanner: {
        name: 'message-banner',
        enabled: parseEnvVarBoolean(
            process.env.UNLEASH_EXPERIMENTAL_MESSAGE_BANNER,
            false,
        ),
        payload: {
            type: PayloadType.JSON,
            value:
                process.env.UNLEASH_EXPERIMENTAL_MESSAGE_BANNER_PAYLOAD ?? '',
        },
    },
    featuresExportImport: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_FEATURES_EXPORT_IMPORT,
        true,
    ),
    caseInsensitiveInOperators: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_CASE_INSENSITIVE_IN_OPERATORS,
        false,
    ),
    strictSchemaValidation: parseEnvVarBoolean(
        process.env.UNLEASH_STRICT_SCHEMA_VALIDTION,
        false,
    ),
    proPlanAutoCharge: parseEnvVarBoolean(
        process.env.UNLEASH_PRO_PLAN_AUTO_CHARGE,
        false,
    ),
    personalAccessTokensKillSwitch: parseEnvVarBoolean(
        process.env.UNLEASH_PAT_KILL_SWITCH,
        false,
    ),
    migrationLock: parseEnvVarBoolean(process.env.MIGRATION_LOCK, true),
    demo: parseEnvVarBoolean(process.env.UNLEASH_DEMO, false),
    googleAuthEnabled: parseEnvVarBoolean(
        process.env.GOOGLE_AUTH_ENABLED,
        false,
    ),
    disableBulkToggle: parseEnvVarBoolean(
        process.env.DISABLE_BULK_TOGGLE,
        false,
    ),
    disableNotifications: parseEnvVarBoolean(
        process.env.DISABLE_NOTIFICATIONS,
        false,
    ),
    strategyVariant: parseEnvVarBoolean(
        process.env.UNLEASH_STRATEGY_VARIANT,
        false,
    ),
    slackAppAddon: parseEnvVarBoolean(
        process.env.UNLEASH_SLACK_APP_ADDON,
        false,
    ),
    filterInvalidClientMetrics: parseEnvVarBoolean(
        process.env.FILTER_INVALID_CLIENT_METRICS,
        false,
    ),
    lastSeenByEnvironment: parseEnvVarBoolean(
        process.env.LAST_SEEN_BY_ENVIRONMENT,
        false,
    ),
    segmentChangeRequests: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_SEGMENT_CHANGE_REQUESTS,
        false,
    ),
    changeRequestReject: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_CHANGE_REQUEST_REJECT,
        false,
    ),
    customRootRolesKillSwitch: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_CUSTOM_ROOT_ROLES_KILL_SWITCH,
        false,
    ),
    integrationsRework: parseEnvVarBoolean(
        process.env.UNLEASH_INTEGRATIONS,
        false,
    ),
    multipleRoles: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_MULTIPLE_ROLES,
        false,
    ),
    newApplicationList: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_NEW_APPLICATION_LIST,
        false,
    ),
    featureNamingPattern: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_FEATURE_NAMING_PATTERN,
        false,
    ),
};

export const defaultExperimentalOptions: IExperimentalOptions = {
    flags,
    externalResolver: {
        isEnabled: (): boolean => false,
        getVariant: () => getDefaultVariant(),
    },
};

export interface IExperimentalOptions {
    flags: IFlags;
    externalResolver: IExternalFlagResolver;
}

export interface IFlagContext {
    [key: string]: string;
}

export interface IFlagResolver {
    getAll: (context?: IFlagContext) => IFlags;
    isEnabled: (expName: IFlagKey, context?: IFlagContext) => boolean;
    getVariant: (expName: IFlagKey, context?: IFlagContext) => Variant;
}

export interface IExternalFlagResolver {
    isEnabled: (flagName: IFlagKey, context?: IFlagContext) => boolean;
    getVariant: (flagName: IFlagKey, context?: IFlagContext) => Variant;
}
