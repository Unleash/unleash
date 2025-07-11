import { PayloadType, type Variant } from 'unleash-client';
import { parseEnvVarBoolean } from '../util/index.js';
import { getDefaultVariant } from 'unleash-client/lib/variant.js';
import type { Context } from '../features/playground/feature-evaluator/index.js';

export type IFlagKey =
    | 'accessLogs'
    | 'anonymiseEventLog'
    | 'encryptEmails'
    | 'enableLicense'
    | 'enableLicenseChecker'
    | 'responseTimeWithAppNameKillSwitch'
    | 'maintenanceMode'
    | 'messageBanner'
    | 'strictSchemaValidation'
    | 'personalAccessTokensKillSwitch'
    | 'migrationLock'
    | 'demo'
    | 'googleAuthEnabled'
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
    | 'productivityReportEmail'
    | 'productivityReportUnsubscribers'
    | 'showUserDeviceCount'
    | 'memorizeStats'
    | 'streaming'
    | 'etagVariant'
    | 'deltaApi'
    | 'uniqueSdkTracking'
    | 'consumptionModel'
    | 'edgeObservability'
    | 'reportUnknownFlags'
    | 'lifecycleMetrics'
    | 'customMetrics'
    | 'impactMetrics'
    | 'createFlagDialogCache'
    | 'improvedJsonDiff'
    | 'crDiffView'
    | 'changeRequestApproverEmails'
    | 'paygTrialEvents'
    | 'eventGrouping';

export type IFlags = Partial<{ [key in IFlagKey]: boolean | Variant }>;

const flags: IFlags = {
    anonymiseEventLog: false,
    enableLicense: false,
    enableLicenseChecker: false,
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
    consumptionModel: parseEnvVarBoolean(
        process.env.EXPERIMENTAL_CONSUMPTION_MODEL,
        false,
    ),
    edgeObservability: parseEnvVarBoolean(
        process.env.EXPERIMENTAL_EDGE_OBSERVABILITY,
        false,
    ),
    reportUnknownFlags: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_REPORT_UNKNOWN_FLAGS,
        false,
    ),
    lifecycleMetrics: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_LIFECYCLE_METRICS,
        false,
    ),
    createFlagDialogCache: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_CREATE_FLAG_DIALOG_CACHE,
        false,
    ),
    changeRequestApproverEmails: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_CHANGE_REQUEST_APPROVER_EMAILS,
        false,
    ),
    improvedJsonDiff: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_IMPROVED_JSON_DIFF,
        false,
    ),
    crDiffView: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_CR_DIFF_VIEW,
        false,
    ),
    impactMetrics: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_IMPACT_METRICS,
        false,
    ),
    eventGrouping: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_EVENT_GROUPING,
        false,
    ),
    paygTrialEvents: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_PAYG_TRIAL_EVENTS,
        false,
    ),
};

export const defaultExperimentalOptions: IExperimentalOptions = {
    flags,
    externalResolver: {
        isEnabled: (): boolean => false,
        getVariant: () => getDefaultVariant(),
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
    incrementCounter(name: string, value?: number, featureName?: string): void;
    updateGauge(name: string, value: number, featureName?: string): void;
}
