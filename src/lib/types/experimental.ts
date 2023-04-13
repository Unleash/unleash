import { parseEnvVarBoolean } from '../util';

export type IFlags = Partial<typeof flags>;
export type IFlagKey = keyof IFlags;

const flags = {
    ENABLE_DARK_MODE_SUPPORT: false,
    anonymiseEventLog: false,
    embedProxy: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_EMBED_PROXY,
        true,
    ),
    projectStatusApi: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_PROJECT_STATUS_API,
        false,
    ),
    newProjectOverview: parseEnvVarBoolean(
        process.env.NEW_PROJECT_OVERVIEW,
        false,
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
    messageBanner: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_MESSAGE_BANNER,
        false,
    ),
    featuresExportImport: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_FEATURES_EXPORT_IMPORT,
        true,
    ),
    caseInsensitiveInOperators: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_CASE_INSENSITIVE_IN_OPERATORS,
        false,
    ),
    crOnVariants: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_CR_ON_VARIANTS,
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
    loginHistory: parseEnvVarBoolean(process.env.UNLEASH_LOGIN_HISTORY, false),
    bulkOperations: parseEnvVarBoolean(
        process.env.UNLEASH_BULK_OPERATIONS,
        false,
    ),
    projectScopedSegments: parseEnvVarBoolean(
        process.env.PROJECT_SCOPED_SEGMENTS,
        false,
    ),
    projectScopedStickiness: parseEnvVarBoolean(
        process.env.PROJECT_SCOPED_STICKINESS,
        false,
    ),
    projectMode: parseEnvVarBoolean(process.env.PROJECT_MODE, false),
    personalAccessTokensKillSwitch: parseEnvVarBoolean(
        process.env.UNLEASH_PAT_KILL_SWITCH,
        false,
    ),
    cleanClientApi: parseEnvVarBoolean(process.env.CLEAN_CLIENT_API, false),
    optimal304: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_OPTIMAL_304,
        false,
    ),
    optimal304Differ: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_OPTIMAL_304_DIFFER,
        false,
    ),
    migrationLock: parseEnvVarBoolean(process.env.MIGRATION_LOCK, false),
    demo: parseEnvVarBoolean(process.env.UNLEASH_DEMO, false),
};

export const defaultExperimentalOptions: IExperimentalOptions = {
    flags,
    externalResolver: { isEnabled: (): boolean => false },
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
}

export interface IExternalFlagResolver {
    isEnabled: (flagName: IFlagKey, context?: IFlagContext) => boolean;
}
