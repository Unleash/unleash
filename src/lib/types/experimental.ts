import { parseEnvVarBoolean } from '../util';

export type IFlags = Partial<Record<string, boolean>>;

export const defaultExperimentalOptions = {
    flags: {
        ENABLE_DARK_MODE_SUPPORT: false,
        anonymiseEventLog: false,
        embedProxy: parseEnvVarBoolean(
            process.env.UNLEASH_EXPERIMENTAL_EMBED_PROXY,
            false,
        ),
        changeRequests: parseEnvVarBoolean(
            process.env.UNLEASH_EXPERIMENTAL_CHANGE_REQUESTS,
            false,
        ),
        syncSSOGroups: parseEnvVarBoolean(
            process.env.UNLEASH_EXPERIMENTAL_SYNC_SSO_GROUPS,
            false,
        ),
        embedProxyFrontend: parseEnvVarBoolean(
            process.env.UNLEASH_EXPERIMENTAL_EMBED_PROXY_FRONTEND,
            false,
        ),
        batchMetrics: parseEnvVarBoolean(
            process.env.UNLEASH_EXPERIMENTAL_BATCH_METRICS,
            false,
        ),
        responseTimeWithAppName: parseEnvVarBoolean(
            process.env.UNLEASH_EXPERIMENTAL_RESPONSE_TIME_WITH_APP_NAME,
            false,
        ),
        cloneEnvironment: parseEnvVarBoolean(
            process.env.UNLEASH_EXPERIMENTAL_CLONE_ENVIRONMENT,
            false,
        ),
        toggleTagFiltering: parseEnvVarBoolean(
            process.env.UNLEASH_EXPERIMENTAL_TOGGLE_TAG_FILTERING,
            false,
        ),
        proxyReturnAllToggles: parseEnvVarBoolean(
            process.env.UNLEASH_EXPERIMENTAL_PROXY_RETURN_ALL_TOGGLES,
            false
        ),
        variantsPerEnvironment: parseEnvVarBoolean(
            process.env.UNLEASH_EXPERIMENTAL_VARIANTS_PER_ENVIRONMENT,
            false,
        ),
    },
    externalResolver: { isEnabled: (): boolean => false },
};

export interface IExperimentalOptions {
    flags: {
        [key: string]: boolean;
        ENABLE_DARK_MODE_SUPPORT?: boolean;
        embedProxy?: boolean;
        embedProxyFrontend?: boolean;
        batchMetrics?: boolean;
        anonymiseEventLog?: boolean;
        syncSSOGroups?: boolean;
        changeRequests?: boolean;
        cloneEnvironment?: boolean;
        proxyReturnAllToggles?: boolean;
        variantsPerEnvironment?: boolean;

    };
    externalResolver: IExternalFlagResolver;
}

export interface IFlagContext {
    [key: string]: string;
}

export interface IFlagResolver {
    getAll: (context?: IFlagContext) => IFlags;
    isEnabled: (expName: string, context?: IFlagContext) => boolean;
}

export interface IExternalFlagResolver {
    isEnabled: (flagName: string, context?: IFlagContext) => boolean;
}
