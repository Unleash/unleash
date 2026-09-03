import { PayloadType, type Variant } from 'unleash-client';
import { defaultVariant } from 'unleash-client/lib/variant.js';
import {
    parseEnvVarBoolean,
    parseEnvVarBooleanOrStringVariant,
} from '../util/index.js';
import type { MetricFlagContext } from 'unleash-client/lib/impact-metrics/metric-types.js';
import type { Context } from '../features/playground/feature-evaluator/index.js';

// biome-ignore lint/suspicious/noEmptyInterface: extension point for packages that embed unleash-server.
export interface IFlagKeyOverrides {}

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
    | 'celebrateUnleash'
    | 'feedbackPosting'
    | 'extendedUsageMetrics'
    | 'feedbackComments'
    | 'usePromiseTokenCache'
    | 'queryMissingTokens' // TODO: nowhere used - to be removed
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
    | 'tokenExpiryNotifications'
    | 'showUserDeviceCount'
    | 'memorizeStats'
    | 'deltaApi'
    | 'uniqueSdkTracking'
    | 'consumptionModel'
    | 'impactViews'
    | 'disableImpactMetrics'
    | 'etagByEnv'
    | 'optimizeLifecycle'
    | 'plausibleMetrics'
    | 'flightRecorderSdk'
    | 'flightRecorderAdminEvents'
    | 'flightRecorderFrontend'
    | 'regexConstraintOperator'
    | 'semverGteConstraintOperators'
    | 'userTokenWithClientApiLoggingKillSwitch'
    | 'multiMetricChart'
    | 'logRocketEnabled'
    | 'hubspotChatEnabled'
    | 'newModalDesign'
    | 'allowDeprecatedApiTokenMiddleware'
    | 'newProfileDropdown'
    | 'serviceNowIntegration'
    | 'learningLab'
    | 'floatingOnboardingChecklist'
    | 'onboardingIntroTour'
    | 'onboardingIntroTourAdvancedTopics'
    | 'topLabelInputs'
    | 'secureTokenStorage'
    | 'secureAccountTokenStorage'
    | 'recordSdkFlavorMetrics'
    | 'searchDocsWidget'
    | 'usersTabsUI'
    | 'semverBuildMetadata'
    | 'slackIntegrationProjectLevel'
    | 'flagStatusTooltips'
    | 'simplerStrategySetup'
    | keyof IFlagKeyOverrides;

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
    onboardingIntroTour: parseEnvVarBoolean(
        process.env.UNLEASH_ONBOARDING_INTRO_TOUR,
        false,
    ),
    onboardingIntroTourAdvancedTopics: parseEnvVarBoolean(
        process.env.UNLEASH_ONBOARDING_INTRO_TOUR_ADVANCED_TOPICS,
        false,
    ),
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
    usePromiseTokenCache: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_USE_PROMISE_TOKEN_CACHE,
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
    // TODO: nowhere used - to be removed
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
    tokenExpiryNotifications: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_TOKEN_EXPIRY_NOTIFICATIONS,
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
    impactViews: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_IMPACT_VIEWS,
        false,
    ),
    disableImpactMetrics: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_DISABLE_IMPACT_METRICS,
        false,
    ),
    plausibleMetrics: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_PLAUSIBLE_METRICS,
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
    semverGteConstraintOperators: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_SEMVER_GTE_CONSTRAINT_OPERATORS,
        false,
    ),
    userTokenWithClientApiLoggingKillSwitch: parseEnvVarBoolean(
        process.env
            .UNLEASH_EXPERIMENTAL_USERTOKEN_WITH_CLIENTAPI_LOGGING_KILL_SWITCH,
        false,
    ),
    multiMetricChart: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_MULTI_METRIC_CHART,
        false,
    ),
    logRocketEnabled: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_LOGROCKET_ENABLED,
        false,
    ),
    hubspotChatEnabled: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_HUBSPOT_CHAT_ENABLED,
        false,
    ),
    newModalDesign: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_NEW_MODAL_DESIGN,
        false,
    ),
    newProfileDropdown: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_NEW_PROFILE_DROPDOWN,
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
    floatingOnboardingChecklist: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_FLOATING_ONBOARDING_CHECKLIST,
        false,
    ),
    serviceNowIntegration: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_SERVICE_NOW_INTEGRATION,
        false,
    ),
    topLabelInputs: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_TOP_LABEL_INPUTS,
        false,
    ),
    recordSdkFlavorMetrics: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_RECORD_SDK_FLAVOR_METRICS,
        false,
    ),
    secureTokenStorage: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_SECURE_TOKEN,
        false,
    ),
    secureAccountTokenStorage: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_SECURE_ACCOUNT_TOKEN,
        false,
    ),
    searchDocsWidget: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_SEARCH_DOCS_WIDGET,
        false,
    ),
    usersTabsUI: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_USERS_TABS_UI,
        false,
    ),
    semverBuildMetadata: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_SEMVER_BUILD_METADATA,
        false,
    ),
    slackIntegrationProjectLevel: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_SLACK_INTEGRATION_PROJECT_LEVEL,
        false,
    ),
    simplerStrategySetup: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_SIMPLER_STRATEGY_SETUP,
        false,
    ),
    flagStatusTooltips: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_FLAG_STATUS_TOOLTIPS,
        false,
    ),
};

export const defaultExperimentalOptions: IExperimentalOptions = {
    flags,
    externalResolver: {
        ready: Promise.resolve(),
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
    ready: Promise<void>;
    getAll: (context?: IFlagContext) => IFlags;
    isEnabled: (expName: IFlagKey, context?: IFlagContext) => boolean;
    getVariant: (expName: IFlagKey, context?: IFlagContext) => Variant;
    getStaticContext: () => IFlagContext;
    impactMetrics?: IImpactMetricsResolver;
}

export interface IExternalFlagResolver {
    ready?: Promise<void>;
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
