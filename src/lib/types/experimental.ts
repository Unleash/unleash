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
    | 'filterInvalidClientMetrics'
    | 'lastSeenByEnvironment'
    | 'customRootRolesKillSwitch'
    | 'featureNamingPattern'
    | 'doraMetrics'
    | 'variantTypeNumber'
    | 'accessOverview'
    | 'privateProjects'
    | 'dependentFeatures'
    | 'datadogJsonTemplate'
    | 'disableMetrics'
    | 'useLastSeenRefactor'
    | 'banners'
    | 'separateAdminClientApi'
    | 'disableEnvsOnRevive'
    | 'playgroundImprovements'
    | 'featureSwitchRefactor'
    | 'featureSearchAPI';

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
    filterInvalidClientMetrics: parseEnvVarBoolean(
        process.env.FILTER_INVALID_CLIENT_METRICS,
        false,
    ),
    lastSeenByEnvironment: parseEnvVarBoolean(
        process.env.LAST_SEEN_BY_ENVIRONMENT,
        false,
    ),
    customRootRolesKillSwitch: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_CUSTOM_ROOT_ROLES_KILL_SWITCH,
        false,
    ),
    featureNamingPattern: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_FEATURE_NAMING_PATTERN,
        false,
    ),
    doraMetrics: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_DORA_METRICS,
        false,
    ),
    dependentFeatures: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_DEPENDENT_FEATURES,
        false,
    ),
    variantTypeNumber: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_VARIANT_TYPE_NUMBER,
        false,
    ),
    privateProjects: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_PRIVATE_PROJECTS,
        false,
    ),
    accessOverview: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_ACCESS_OVERVIEW,
        false,
    ),
    datadogJsonTemplate: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_DATADOG_JSON_TEMPLATE,
        false,
    ),
    disableMetrics: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_DISABLE_METRICS,
        false,
    ),
    useLastSeenRefactor: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_USE_LAST_SEEN_REFACTOR,
        false,
    ),
    banners: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_BANNERS,
        false,
    ),
    separateAdminClientApi: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_SEPARATE_ADMIN_CLIENT_API,
        false,
    ),
    disableEnvsOnRevive: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_DISABLE_ENVS_ON_REVIVE,
        false,
    ),
    playgroundImprovements: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_PLAYGROUND_IMPROVEMENTS,
        false,
    ),
    featureSwitchRefactor: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_FEATURE_SWITCH_REFACTOR,
        false,
    ),
    featureSearchAPI: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_FEATURE_SEARCH_API,
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
