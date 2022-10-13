import { parseEnvVarBoolean } from '../util/parseEnvVar';

export type IFlags = Partial<Record<string, boolean>>;

export const defaultExperimentalOptions = {
    flags: {
        ENABLE_DARK_MODE_SUPPORT: false,
        anonymiseEventLog: false,
        embedProxy: parseEnvVarBoolean(
            process.env.UNLEASH_EXPERIMENTAL_EMBED_PROXY,
            false,
        ),
        personalAccessTokens: parseEnvVarBoolean(
            process.env.UNLEASH_EXPERIMENTAL_PERSONAL_ACCESS_TOKENS,
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
        publicSignup: parseEnvVarBoolean(
            process.env.UNLEASH_EXPERIMENTAL_PUBLIC_SIGNUP,
            false,
        ),
        responseTimeWithAppName: parseEnvVarBoolean(
            process.env.UNLEASH_EXPERIMENTAL_RESPONSE_TIME_WITH_APP_NAME,
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
        personalAccessTokens?: boolean;
        syncSSOGroups?: boolean;
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
