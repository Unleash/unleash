import { Variant, PayloadType } from 'unleash-client';
import { parseEnvVarBoolean } from '../util';
import { getDefaultVariant } from 'unleash-client/lib/variant';

export type IFlagKey =
    | 'accessLogs'
    | 'anonymiseEventLog'
    | 'encryptEmails'
    | 'enableLicense'
    | 'enableLicenseChecker'
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
    | 'filterInvalidClientMetrics'
    | 'customRootRolesKillSwitch'
    | 'disableMetrics'
    | 'scheduledConfigurationChanges'
    | 'stripClientHeadersOn304'
    | 'newStrategyConfiguration'
    | 'stripHeadersOnAPI'
    | 'incomingWebhooks'
    | 'automatedActions'
    | 'celebrateUnleash'
    | 'increaseUnleashWidth'
    | 'featureSearchFeedback'
    | 'featureSearchFeedbackPosting'
    | 'newStrategyConfigurationFeedback'
    | 'edgeBulkMetrics'
    | 'extendedUsageMetrics'
    | 'extendedUsageMetricsUI'
    | 'adminTokenKillSwitch'
    | 'changeRequestConflictHandling'
    | 'executiveDashboard'
    | 'feedbackComments'
    | 'createdByUserIdDataMigration'
    | 'showInactiveUsers'
    | 'inMemoryScheduledChangeRequests'
    | 'trafficDataUsage'
    | 'useMemoizedActiveTokens';

export type IFlags = Partial<{ [key in IFlagKey]: boolean | Variant }>;

const flags: IFlags = {
    anonymiseEventLog: false,
    enableLicense: false,
    enableLicenseChecker: false,
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
    filterInvalidClientMetrics: parseEnvVarBoolean(
        process.env.FILTER_INVALID_CLIENT_METRICS,
        false,
    ),
    customRootRolesKillSwitch: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_CUSTOM_ROOT_ROLES_KILL_SWITCH,
        false,
    ),
    disableMetrics: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_DISABLE_METRICS,
        false,
    ),
    scheduledConfigurationChanges: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_SCHEDULED_CONFIGURATION_CHANGES,
        false,
    ),
    stripClientHeadersOn304: parseEnvVarBoolean(
        process.env
            .UNLEASH_EXPERIMENTAL_DETECT_SEGMENT_USAGE_IN_CHANGE_REQUESTS,
        false,
    ),
    newStrategyConfiguration: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_NEW_STRATEGY_CONFIGURATION,
        false,
    ),
    incomingWebhooks: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_INCOMING_WEBHOOKS,
        false,
    ),
    automatedActions: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_AUTOMATED_ACTIONS,
        false,
    ),
    celebrateUnleash: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_CELEBRATE_UNLEASH,
        false,
    ),
    increaseUnleashWidth: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_INCREASE_UNLEASH_WIDTH,
        false,
    ),
    featureSearchFeedback: {
        name: 'withText',
        enabled: parseEnvVarBoolean(
            process.env.UNLEASH_EXPERIMENTAL_FEATURE_SEARCH_FEEDBACK,
            false,
        ),
        payload: {
            type: PayloadType.JSON,
            value:
                process.env
                    .UNLEASH_EXPERIMENTAL_FEATURE_SEARCH_FEEDBACK_PAYLOAD ?? '',
        },
    },
    featureSearchFeedbackPosting: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_FEATURE_SEARCH_FEEDBACK_POSTING,
        false,
    ),
    newStrategyConfigurationFeedback: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_NEW_STRATEGY_CONFIGURATION_FEEDBACK,
        false,
    ),
    encryptEmails: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_ENCRYPT_EMAILS,
        false,
    ),
    edgeBulkMetrics: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_EDGE_BULK_METRICS,
        false,
    ),
    extendedUsageMetrics: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_EXTENDED_USAGE_METRICS,
        false,
    ),
    extendedUsageMetricsUI: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_EXTENDED_USAGE_METRICS_UI,
        false,
    ),
    adminTokenKillSwitch: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_ADMIN_TOKEN_KILL_SWITCH,
        false,
    ),
    changeRequestConflictHandling: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_CHANGE_REQUEST_CONFLICT_HANDLING,
        false,
    ),
    executiveDashboard: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_EXECUTIVE_DASHBOARD,
        false,
    ),
    feedbackComments: {
        name: 'feedbackComments',
        enabled: parseEnvVarBoolean(
            process.env.UNLEASH_EXPERIMENTAL_FEEDBACK_COMMENTS,
            false,
        ),
        payload: {
            type: PayloadType.JSON,
            value:
                process.env.UNLEASH_EXPERIMENTAL_FEEDBACK_COMMENTS_PAYLOAD ??
                '',
        },
    },
    createdByUserIdDataMigration: parseEnvVarBoolean(
        process.env.CREATED_BY_USERID_DATA_MIGRATION,
        false,
    ),
    showInactiveUsers: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_SHOW_INACTIVE_USERS,
        false,
    ),
    useMemoizedActiveTokens: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_MEMOIZED_ACTIVE_TOKENS,
        false,
    ),
    inMemoryScheduledChangeRequests: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_IN_MEMORY_SCHEDULED_CHANGE_REQUESTS,
        false,
    ),
    trafficDataUsage: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_TRAFFIC_DATA_USAGE,
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
