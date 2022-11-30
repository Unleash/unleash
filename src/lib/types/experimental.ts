import { parseEnvVarBoolean } from '../util';

export type IFlags = IExperimentalOptions['flags'];
export type IFlagKey = keyof IFlags;

export const defaultExperimentalOptions: IExperimentalOptions = {
    flags: {
        ENABLE_DARK_MODE_SUPPORT: false,
        anonymiseEventLog: false,
        embedProxy: parseEnvVarBoolean(
            process.env.UNLEASH_EXPERIMENTAL_EMBED_PROXY,
            true,
        ),
        changeRequests: parseEnvVarBoolean(
            process.env.UNLEASH_EXPERIMENTAL_CHANGE_REQUESTS,
            false,
        ),
        embedProxyFrontend: parseEnvVarBoolean(
            process.env.UNLEASH_EXPERIMENTAL_EMBED_PROXY_FRONTEND,
            true,
        ),
        batchMetrics: parseEnvVarBoolean(
            process.env.UNLEASH_EXPERIMENTAL_BATCH_METRICS,
            false,
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
        favorites: parseEnvVarBoolean(
            process.env.UNLEASH_EXPERIMENTAL_FAVORITES,
            false,
        ),
        maintenance: parseEnvVarBoolean(
            process.env.UNLEASH_EXPERIMENTAL_MAINTENANCE,
            false,
        ),
        networkView: parseEnvVarBoolean(
            process.env.UNLEASH_EXPERIMENTAL_NETWORK_VIEW,
            false,
        ),
    },
    externalResolver: { isEnabled: (): boolean => false },
};

export interface IExperimentalOptions {
    flags: {
        E?: boolean;
        ENABLE_DARK_MODE_SUPPORT?: boolean;
        embedProxy?: boolean;
        embedProxyFrontend?: boolean;
        batchMetrics?: boolean;
        anonymiseEventLog?: boolean;
        changeRequests?: boolean;
        responseTimeWithAppName?: boolean;
        toggleTagFiltering?: boolean;
        proxyReturnAllToggles?: boolean;
        variantsPerEnvironment?: boolean;
        favorites?: boolean;
        networkView?: boolean;
        maintenance?: boolean;
    };
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
