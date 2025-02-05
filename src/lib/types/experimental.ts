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
    | 'signals'
    | 'automatedActions'
    | 'celebrateUnleash'
    | 'feedbackPosting'
    | 'extendedUsageMetrics'
    | 'feedbackComments'
    | 'showInactiveUsers'
    | 'killScheduledChangeRequestCache'
    | 'estimateTrafficDataCost'
    | 'useMemoizedActiveTokens'
    | 'queryMissingTokens'
    | 'userAccessUIEnabled'
    | 'disableUpdateMaxRevisionId'
    | 'disablePublishUnannouncedEvents'
    | 'outdatedSdksBanner'
    | 'responseTimeMetricsFix'
    | 'disableShowContextFieldSelectionValues'
    | 'manyStrategiesPagination'
    | 'enableLegacyVariants'
    | 'extendedMetrics'
    | 'removeUnsafeInlineStyleSrc'
    | 'projectRoleAssignment'
    | 'originMiddlewareRequestLogging'
    | 'webhookDomainLogging'
    | 'releasePlans'
    | 'releasePlanChangeRequests'
    | 'productivityReportEmail'
    | 'productivityReportUnsubscribers'
    | 'enterprise-payg'
    | 'flagOverviewRedesign'
    | 'showUserDeviceCount'
    | 'memorizeStats'
    | 'granularAdminPermissions'
    | 'streaming'
    | 'etagVariant'
    | 'deltaApi'
    | 'uniqueSdkTracking'
    | 'sortProjectRoles'
    | 'frontendHeaderRedesign'
    | 'dataUsageMultiMonthView'
    | 'uiGlobalFontSize';

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
    feedbackPosting: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_FEEDBACK_POSTING,
        false,
    ),
    encryptEmails: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_ENCRYPT_EMAILS,
        false,
    ),
    extendedUsageMetrics: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_EXTENDED_USAGE_METRICS,
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
    showInactiveUsers: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_SHOW_INACTIVE_USERS,
        false,
    ),
    useMemoizedActiveTokens: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_MEMOIZED_ACTIVE_TOKENS,
        false,
    ),
    killScheduledChangeRequestCache: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_KILL_SCHEDULED_CHANGE_REQUEST_CACHE,
        false,
    ),
    estimateTrafficDataCost: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_ESTIMATE_TRAFFIC_DATA_COST,
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
    responseTimeMetricsFix: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_RESPONSE_TIME_METRICS_FIX,
        false,
    ),
    disableShowContextFieldSelectionValues: parseEnvVarBoolean(
        process.env
            .UNLEASH_EXPERIMENTAL_DISABLE_SHOW_CONTEXT_FIELD_SELECTION_VALUES,
        false,
    ),
    manyStrategiesPagination: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_MANY_STRATEGIES_PAGINATION,
        false,
    ),
    enableLegacyVariants: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_ENABLE_LEGACY_VARIANTS,
        false,
    ),
    extendedMetrics: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_EXTENDED_METRICS,
        false,
    ),
    removeUnsafeInlineStyleSrc: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_REMOVE_UNSAFE_INLINE_STYLE_SRC,
        false,
    ),
    projectRoleAssignment: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_PROJECT_ROLE_ASSIGNMENT,
        false,
    ),
    originMiddlewareRequestLogging: parseEnvVarBoolean(
        process.env.UNLEASH_ORIGIN_MIDDLEWARE_REQUEST_LOGGING,
        false,
    ),
    webhookDomainLogging: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENT_WEBHOOK_DOMAIN_LOGGING,
        false,
    ),
    releasePlans: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_RELEASE_PLANS,
        false,
    ),
    releasePlanChangeRequests: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_RELEASE_PLAN_CHANGE_REQUESTS,
        false,
    ),
    productivityReportEmail: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_PRODUCTIVITY_REPORT_EMAIL,
        false,
    ),
    productivityReportUnsubscribers: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_PRODUCTIVITY_REPORT_UNSUBSCRIBERS,
        false,
    ),
    'enterprise-payg': parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_ENTERPRISE_PAYG,
        false,
    ),
    showUserDeviceCount: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_SHOW_USER_DEVICE_COUNT,
        false,
    ),
    flagOverviewRedesign: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_FLAG_OVERVIEW_REDESIGN,
        false,
    ),
    granularAdminPermissions: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_GRANULAR_ADMIN_PERMISSIONS,
        false,
    ),
    streaming: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_STREAMING,
        false,
    ),
    etagVariant: {
        name: 'disabled',
        feature_enabled: false,
        enabled: false,
    },
    deltaApi: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_DELTA_API,
        false,
    ),
    uniqueSdkTracking: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_UNIQUE_SDK_TRACKING,
        false,
    ),
    sortProjectRoles: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_SORT_PROJECT_ROLES,
        false,
    ),
    frontendHeaderRedesign: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_FRONTEND_HEADER_REDESIGN,
        false,
    ),
    dataUsageMultiMonthView: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_DATA_USAGE_MULTI_MONTH_VIEW,
        false,
    ),
    uiGlobalFontSize: {
        name: 'uiGlobalFontSize',
        enabled: parseEnvVarBoolean(
            process.env.EXPERIMENTAL_UI_GLOBAL_FONT_SIZE_NAME,
            false,
        ),
        payload: {
            type: PayloadType.JSON,
            value: '14',
        },
    },
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
