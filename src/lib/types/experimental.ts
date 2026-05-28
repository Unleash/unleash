import { PayloadType, type Variant } from 'unleash-client';
import { defaultVariant } from 'unleash-client/lib/variant.js';
import {
    parseEnvVarBoolean,
    parseEnvVarBooleanOrStringVariant,
} from '../util/index.js';
import type { MetricFlagContext } from 'unleash-client/lib/impact-metrics/metric-types.js';
import type { Context } from '../features/playground/feature-evaluator/index.js';

// biome-ignore lint/suspicious/noEmptyInterface: extension point for enterprise module augmentation
export interface IFlagKeyOverrides {}

export type IOssFlagKey =
    | 'accessLogs'
    | 'anonymiseEventLog'
    | 'encryptEmails' // enterprise-owned; kept in OSS until middleware usage moves
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
    | 'celebrateUnleash'
    | 'feedbackPosting'
    | 'extendedUsageMetrics'
    | 'feedbackComments'
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
    | 'deltaApi' // enterprise-owned; kept in OSS until delta API usage moves
    | 'deltaDiff' // enterprise-owned; kept in OSS until delta diff usage moves
    | 'uniqueSdkTracking'
    | 'customMetrics'
    | 'impactMetrics' // enterprise-owned; kept in OSS until metrics usage moves
    | 'etagByEnv'
    | 'optimizeLifecycle'
    | 'plausibleMetrics'
    | 'newInUnleash'
    | 'regexConstraintOperator'
    | 'userTokenWithClientApiLoggingKillSwitch'
    | 'onlyFeatureTokensWithFeatureAPIs'
    | 'onboardingProjectSetupNewSteps'
    | 'multiMetricChart'
    | 'accessOverviewRework'
    | 'onboardingConnectSDKNewDialog'
    | 'logRocketEnabled'
    | 'newProjectList'
    | 'reactRouter_v7_relativeSplatPath'
    | 'reactRouter_v7_startTransition';

export type IFlagKey = IOssFlagKey | keyof IFlagKeyOverrides;

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
    deltaDiff: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_DELTA_DIFF,
        false,
    ),
    uniqueSdkTracking: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_UNIQUE_SDK_TRACKING,
        false,
    ),
    impactMetrics: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_IMPACT_METRICS,
        false,
    ),
    plausibleMetrics: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_PLAUSIBLE_METRICS,
        false,
    ),
    newInUnleash: parseEnvVarBooleanOrStringVariant(
        process.env.UNLEASH_EXPERIMENTAL_NEW_IN_UNLEASH,
        false,
    ),
    regexConstraintOperator: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_REGEX_CONSTRAINT_OPERATOR,
        false,
    ),
    userTokenWithClientApiLoggingKillSwitch: parseEnvVarBoolean(
        process.env
            .UNLEASH_EXPERIMENTAL_USERTOKEN_WITH_CLIENTAPI_LOGGING_KILL_SWITCH,
        false,
    ),
    onlyFeatureTokensWithFeatureAPIs: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_ONLY_FEATURE_TOKENS_WITH_FEATURE_APIS,
        false,
    ),
    onboardingProjectSetupNewSteps: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_ONBOARDING_PROJECT_SETUP_NEW_STEPS,
        false,
    ),
    multiMetricChart: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_MULTI_METRIC_CHART,
        false,
    ),
    accessOverviewRework: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_ACCESS_OVERVIEW_REWORK,
        false,
    ),
    onboardingConnectSDKNewDialog: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_ONBOARDING_CONNECT_SDK_NEW_DIALOG,
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
    reactRouter_v7_startTransition: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_REACT_ROUTER_V7_START_TRANSITION,
        false,
    ),
    reactRouter_v7_relativeSplatPath: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_REACT_ROUTER_V7_RELATIVE_SPLAT_PATH,
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
