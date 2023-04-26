import { parseEnvVarBoolean } from '../util';

export type IFlags = Partial<typeof flags>;
export type IFlagKey = keyof IFlags;

const flags = {
    anonymiseEventLog: false,
    embedProxy: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_EMBED_PROXY,
        true,
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
    bulkOperations: parseEnvVarBoolean(
        process.env.UNLEASH_BULK_OPERATIONS,
        false,
    ),
    projectScopedStickiness: parseEnvVarBoolean(
        process.env.PROJECT_SCOPED_STICKINESS,
        false,
    ),
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
    groupRootRoles: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_ROOT_ROLE_GROUPS,
        false,
    ),
    migrationLock: parseEnvVarBoolean(process.env.MIGRATION_LOCK, false),
    demo: parseEnvVarBoolean(process.env.UNLEASH_DEMO, false),
    strategyTitle: parseEnvVarBoolean(
        process.env.UNLEASH_STRATEGY_TITLE,
        false,
    ),
    strategyDisable: parseEnvVarBoolean(
        process.env.UNLEASH_STRATEGY_DISABLE,
        false,
    ),
    googleAuthEnabled: parseEnvVarBoolean(
        process.env.GOOGLE_AUTH_ENABLED,
        false,
    ),
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
