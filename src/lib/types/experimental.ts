import { parseEnvVarBoolean } from '../util/parseEnvVar';

export type IFlags = Partial<Record<string, boolean>>;

export const defaultExperimentalOptions = {
    flags: {
        ENABLE_DARK_MODE_SUPPORT: false,
        anonymiseEventLog: false,
        userGroups: false,
        embedProxy: parseEnvVarBoolean(
            process.env.UNLEASH_EXPERIMENTAL_EMBED_PROXY,
            false,
        ),
        batchMetrics: parseEnvVarBoolean(
            process.env.UNLEASH_EXPERIMENTAL_BATCH_METRICS,
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
        batchMetrics?: boolean;
        anonymiseEventLog?: boolean;
        userGroups?: boolean;
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
