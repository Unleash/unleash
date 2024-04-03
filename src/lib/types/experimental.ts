import { PayloadType, type Variant } from 'unleash-client';
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
    | 'personalAccessTokensKillSwitch'
    | 'migrationLock'
    | 'demo'
    | 'googleAuthEnabled'
    | 'disableBulkToggle'
    | 'disableNotifications'
    | 'advancedPlayground'
    | 'filterInvalidClientMetrics'
    | 'disableMetrics'
    | 'stripClientHeadersOn304'
    | 'stripHeadersOnAPI'
    | 'signals'
    | 'automatedActions'
    | 'celebrateUnleash'
    | 'featureSearchFeedback'
    | 'featureSearchFeedbackPosting'
    | 'edgeBulkMetrics'
    | 'extendedUsageMetrics'
    | 'adminTokenKillSwitch'
    | 'executiveDashboard'
    | 'executiveDashboardUI'
    | 'feedbackComments'
    | 'createdByUserIdDataMigration'
    | 'showInactiveUsers'
    | 'inMemoryScheduledChangeRequests'
    | 'collectTrafficDataUsage'
    | 'useMemoizedActiveTokens'
    | 'queryMissingTokens'
    | 'userAccessUIEnabled'
    | 'disableUpdateMaxRevisionId'
    | 'disablePublishUnannouncedEvents'
    | 'outdatedSdksBanner'
    | 'responseTimeMetricsFix'
    | 'scimApi'
    | 'displayEdgeBanner'
    | 'globalFrontendApiCache'
    | 'returnGlobalFrontendApiCache'
    | 'projectOverviewRefactor'
    | 'variantDependencies'
    | 'newContextFieldsUI'
    | 'bearerTokenMiddleware'
    | 'projectOverviewRefactorFeedback';

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
    disableMetrics: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_DISABLE_METRICS,
        false,
    ),
    stripClientHeadersOn304: parseEnvVarBoolean(
        process.env
            .UNLEASH_EXPERIMENTAL_DETECT_SEGMENT_USAGE_IN_CHANGE_REQUESTS,
        false,
    ),
    signals: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_SIGNALS,
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
    adminTokenKillSwitch: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_ADMIN_TOKEN_KILL_SWITCH,
        false,
    ),
    executiveDashboard: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_EXECUTIVE_DASHBOARD,
        false,
    ),
    executiveDashboardUI: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_EXECUTIVE_DASHBOARD_UI,
        false,
    ),
    outdatedSdksBanner: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_OUTDATED_SDKS_BANNER,
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
    collectTrafficDataUsage: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_COLLECT_TRAFFIC_DATA_USAGE,
        false,
    ),
    userAccessUIEnabled: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_USER_ACCESS_UI_ENABLED,
        false,
    ),
    disableUpdateMaxRevisionId: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_DISABLE_SCHEDULED_CACHES,
        false,
    ),
    disablePublishUnannouncedEvents: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_DISABLE_SCHEDULED_CACHES,
        false,
    ),
    queryMissingTokens: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_QUERY_MISSING_TOKENS,
        false,
    ),
    scimApi: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_SCIM_API,
        false,
    ),
    displayEdgeBanner: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_DISPLAY_EDGE_BANNER,
        false,
    ),
    responseTimeMetricsFix: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_RESPONSE_TIME_METRICS_FIX,
        false,
    ),
    globalFrontendApiCache: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_GLOBAL_FRONTEND_API_CACHE,
        false,
    ),
    returnGlobalFrontendApiCache: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_RETURN_GLOBAL_FRONTEND_API_CACHE,
        false,
    ),
    projectOverviewRefactor: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_PROJECT_OVERVIEW_REFACTOR,
        false,
    ),
    newContextFieldsUI: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_NEW_CONTEXT_FIELDS_UI,
        false,
    ),
    variantDependencies: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_VARIANT_DEPENDENCIES,
        false,
    ),
    bearerTokenMiddleware: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_BEARER_TOKEN_MIDDLEWARE,
        false,
    ),
    projectOverviewRefactorFeedback: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_PROJECT_OVERVIEW_REFACTOR_FEEDBACK,
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
