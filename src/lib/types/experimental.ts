import { PayloadType, type Variant } from 'unleash-client';
import { parseEnvVarBoolean } from '../util/index.js';
import { getDefaultVariant } from 'unleash-client/lib/variant.js';
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
    | 'edgeObservability'
    | 'customMetrics'
    | 'impactMetrics'
    | 'lifecycleGraphs'
    | 'etagByEnv'
    | 'fetchMode'
    | 'optimizeLifecycle'
    | 'newStrategyModal'
    | 'globalChangeRequestList'
    | 'trafficBillingDisplay'
    | 'milestoneProgression'
    | 'featureReleasePlans'
    | 'plausibleMetrics'
    | 'safeguards';

export type IFlags = Partial<{ [key in IFlagKey]: boolean | Variant }>;

const flags: IFlags = {
    anonymiseEventLog: false,
    enableLicense: false,
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
    edgeObservability: parseEnvVarBoolean(
        process.env.EXPERIMENTAL_EDGE_OBSERVABILITY,
        false,
    ),
    impactMetrics: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_IMPACT_METRICS,
        false,
    ),
    lifecycleGraphs: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_LIFECYCLE_GRAPHS,
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
    newStrategyModal: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_NEW_STRATEGY_MODAL,
        false,
    ),
    globalChangeRequestList: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_GLOBAL_CHANGE_REQUEST_LIST,
        false,
    ),
    trafficBillingDisplay: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_TRAFFIC_BILLING_DISPLAY,
        false,
    ),
    milestoneProgression: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_MILESTONE_PROGRESSION,
        false,
    ),
    featureReleasePlans: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_FEATURE_RELEASE_PLANS,
        false,
    ),
    plausibleMetrics: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_PLAUSIBLE_METRICS,
        false,
    ),
    safeguards: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_SAFEGUARDS,
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
