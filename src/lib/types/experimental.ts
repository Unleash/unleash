import { PayloadType, type Variant } from 'unleash-client';
import { defaultVariant } from 'unleash-client/lib/variant.js';
import {
    parseEnvVarBoolean,
    parseEnvVarBooleanOrStringVariant,
} from '../util/index.js';
import type { MetricFlagContext } from 'unleash-client/lib/impact-metrics/metric-types.js';
import type { Context } from '../features/playground/feature-evaluator/index.js';

export type IFlagKey =
    | 'accessLogs'
    | 'anonymiseEventLog'
    | 'encryptEmails'
    | 'enableLicense'
    | 'responseTimeWithAppNameKillSwitch'
    | 'maintenanceMode'
    | 'messageBanner'
    | 'strictSchemaValidation'
    | 'personalAccessTokensKillSwitch'
    | 'migrationLock'
    | 'demo'
    | 'interactiveDemoKillSwitch'
    | 'advancedPlayground'
    | 'filterInvalidClientMetrics'
    | 'disableMetrics'
    | 'signals'
    | 'automatedActions'
    | 'celebrateUnleash'
    | 'feedbackPosting'
    | 'extendedUsageMetrics'
    | 'feedbackComments'
    | 'killScheduledChangeRequestCache'
    | 'estimateTrafficDataCost'
    | 'useMemoizedActiveTokens'
    | 'queryMissingTokens'
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
    | 'webhookDomainLogging'
    | 'productivityReportEmail'
    | 'productivityReportUnsubscribers'
    | 'showUserDeviceCount'
    | 'memorizeStats'
    | 'streaming'
    | 'denyStreamingForNonEdge'
    | 'deltaApi'
    | 'uniqueSdkTracking'
    | 'consumptionModel'
    | 'consumptionModelUI'
    | 'customMetrics'
    | 'impactViews'
    | 'registerImpactMetrics'
    | 'disableImpactMetrics'
    | 'etagByEnv'
    | 'fetchMode'
    | 'optimizeLifecycle'
    | 'plausibleMetrics'
    | 'newInUnleash'
    | 'oidcPkceSupport'
    | 'flightRecorderSdk'
    | 'flightRecorderAdminEvents'
    | 'flightRecorderFrontend'
    | 'regexConstraintOperator'
    | 'enterpriseEdgeTokensList'
    | 'impactMetricsFlagPage'
    | 'userTokenWithClientApiLoggingKillSwitch'
    | 'disableScimAdminGroupGuard'
    | 'multiMetricChart'
    | 'elasticEventSync'
    | 'logRocketEnabled'
    | 'newProjectList'
    | 'newModalDesign'
    | 'archiveInFlagsView'
    | 'allowDeprecatedApiTokenMiddleware'
    | 'newProfileDropdown'
    | 'hideTopmenuDocumentation'
    | 'serviceNowIntegration'
    | 'learningLab'
    | 'accessRequestsNotifications'
    | 'accessRequestsMenuIndicator';

export type IFlags = Partial<{ [key in IFlagKey]: boolean | Variant }>;

const flags: IFlags = {
    anonymiseEventLog: false,
    enableLicense: false,
    responseTimeWithAppNameKillSwitch: parseEnvVarBoolean(
        process.env.UNLEASH_RESPONSE_TIME_WITH_APP_NAME_KILL_SWITCH,
        false,
    ),
    maintenanceMode: parseEnvVarBooleanOrStringVariant(
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
    interactiveDemoKillSwitch: parseEnvVarBoolean(
        process.env.UNLEASH_INTERACTIVE_DEMO_KILL_SWITCH,
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
    webhookDomainLogging: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENT_WEBHOOK_DOMAIN_LOGGING,
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
    showUserDeviceCount: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_SHOW_USER_DEVICE_COUNT,
        false,
    ),
    deltaApi: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_DELTA_API,
        false,
    ),
    uniqueSdkTracking: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_UNIQUE_SDK_TRACKING,
        false,
    ),
    consumptionModel: parseEnvVarBoolean(
        process.env.EXPERIMENTAL_CONSUMPTION_MODEL,
        false,
    ),
    consumptionModelUI: parseEnvVarBoolean(
        process.env.EXPERIMENTAL_CONSUMPTION_MODEL_UI,
        false,
    ),
    impactViews: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_IMPACT_VIEWS,
        false,
    ),
    registerImpactMetrics: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_REGISTER_IMPACT_METRICS,
        false,
    ),
    disableImpactMetrics: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_DISABLE_IMPACT_METRICS,
        false,
    ),
    streaming: {
        name: 'disabled',
        enabled: parseEnvVarBoolean(
            process.env.UNLEASH_EXPERIMENTAL_STREAMING,
            false,
        ),
    },
    denyStreamingForNonEdge: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_STREAMING_DENY_STREAMING_FOR_NON_EDGE,
        false,
    ),
    fetchMode: {
        name: 'disabled',
        enabled: parseEnvVarBoolean(
            process.env.UNLEASH_EXPERIMENTAL_FETCH_MODE,
            false,
        ),
    },
    plausibleMetrics: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_PLAUSIBLE_METRICS,
        false,
    ),
    oidcPkceSupport: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_OIDC_PKCE_SUPPORT,
        false,
    ),
    newInUnleash: parseEnvVarBooleanOrStringVariant(
        process.env.UNLEASH_EXPERIMENTAL_NEW_IN_UNLEASH,
        false,
    ),
    flightRecorderSdk: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_FLIGHT_RECORDER_SDK,
        false,
    ),
    flightRecorderAdminEvents: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_FLIGHT_RECORDER_ADMIN_EVENTS,
        false,
    ),
    flightRecorderFrontend: {
        name: 'flightRecorderFrontend',
        enabled: parseEnvVarBoolean(
            process.env.UNLEASH_EXPERIMENTAL_FLIGHT_RECORDER_FRONTEND,
            false,
        ),
        payload: {
            type: PayloadType.STRING,
            value:
                process.env.UNLEASH_EXPERIMENTAL_FLIGHT_RECORDER_FRONTEND_URL ??
                '',
        },
    },
    regexConstraintOperator: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_REGEX_CONSTRAINT_OPERATOR,
        false,
    ),
    enterpriseEdgeTokensList: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_ENTERPRISE_EDGE_TOKENS_LIST,
        false,
    ),
    impactMetricsFlagPage: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_IMPACT_METRICS_FLAG_PAGE,
        false,
    ),
    userTokenWithClientApiLoggingKillSwitch: parseEnvVarBoolean(
        process.env
            .UNLEASH_EXPERIMENTAL_USERTOKEN_WITH_CLIENTAPI_LOGGING_KILL_SWITCH,
        false,
    ),
    disableScimAdminGroupGuard: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_DISABLE_SCIM_ADMIN_GROUP_GUARD,
        false,
    ),
    multiMetricChart: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_MULTI_METRIC_CHART,
        false,
    ),
    elasticEventSync: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_ELASTIC_EVENT_SYNC,
        false,
    ),
    logRocketEnabled: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_LOGROCKET_ENABLED,
        false,
    ),
    newProjectList: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_NEW_PROJECT_LIST,
        false,
    ),
    newModalDesign: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_NEW_MODAL_DESIGN,
        false,
    ),
    archiveInFlagsView: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_ARCHIVE_IN_FLAGS_VIEW,
        false,
    ),
    newProfileDropdown: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_NEW_PROFILE_DROPDOWN,
        false,
    ),
    hideTopmenuDocumentation: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_HIDE_TOPMENU_DOCUMENTATION,
        false,
    ),
    learningLab: {
        name: 'learningLab',
        enabled: parseEnvVarBoolean(
            process.env.UNLEASH_EXPERIMENTAL_LEARNING_LAB,
            false,
        ),
        payload: {
            type: PayloadType.JSON,
            value: process.env.UNLEASH_EXPERIMENTAL_LEARNING_LAB_PAYLOAD ?? '',
        },
    },
    serviceNowIntegration: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_SERVICE_NOW_INTEGRATION,
        false,
    ),
    accessRequestsNotifications: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_ACCESS_REQUESTS_NOTIFICATIONS,
        false,
    ),
    accessRequestsMenuIndicator: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_ACCESS_REQUESTS_MENU_INDICATOR,
        false,
    ),
};

export const defaultExperimentalOptions: IExperimentalOptions = {
    flags,
    externalResolver: {
        isEnabled: (): boolean => false,
        getVariant: () => defaultVariant,
        getStaticContext: () => ({}),
    },
};

export interface IExperimentalOptions {
    flags: IFlags;
    externalResolver: IExternalFlagResolver;
}

export interface IFlagContext extends Context {}

export interface IFlagResolver {
    getAll: (context?: IFlagContext) => IFlags;
    isEnabled: (expName: IFlagKey, context?: IFlagContext) => boolean;
    getVariant: (expName: IFlagKey, context?: IFlagContext) => Variant;
    getStaticContext: () => IFlagContext;
    impactMetrics?: IImpactMetricsResolver;
}

export interface IExternalFlagResolver {
    isEnabled: (flagName: IFlagKey, context?: IFlagContext) => boolean;
    getVariant: (flagName: IFlagKey, context?: IFlagContext) => Variant;
    getStaticContext: () => IFlagContext;
    impactMetrics?: IImpactMetricsResolver;
}

export interface IImpactMetricsResolver {
    defineCounter(name: string, help: string);
    defineGauge(name: string, help: string);
    defineHistogram(name: string, help: string, buckets?: number[]);
    incrementCounter(
        name: string,
        value?: number,
        metricsFlagContext?: MetricFlagContext,
    ): void;
    updateGauge(
        name: string,
        value: number,
        metricsFlagContext?: MetricFlagContext,
    ): void;
    observeHistogram(
        name: string,
        value: number,
        metricsFlagContext?: MetricFlagContext,
    ): void;
}
