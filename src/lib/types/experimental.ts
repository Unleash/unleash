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
    responseTimeWithAppName: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_RESPONSE_TIME_WITH_APP_NAME,
        false,
    ),
    proxyReturnAllToggles: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_PROXY_RETURN_ALL_TOGGLES,
        false,
    ),
    variantsPerEnvironment: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_VARIANTS_PER_ENVIRONMENT,
        false,
    ),
    networkView: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_NETWORK_VIEW,
        false,
    ),
    maintenance: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_MAINTENANCE,
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
        false,
    ),
    caseInsensitiveInOperators: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_CASE_INSENSITIVE_IN_OPERATORS,
        false,
    ),
    crOnVariants: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_CR_ON_VARIANTS,
        false,
    ),
    showProjectApiAccess: parseEnvVarBoolean(
        process.env.UNLEASH_EXPERIMENTAL_PROJECT_API_ACCESS,
        false,
    ),
    strictSchemaValidation: parseEnvVarBoolean(
        process.env.UNLEASH_STRICT_SCHEMA_VALIDTION,
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
