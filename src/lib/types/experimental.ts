export interface IFlags {
    [key: string]: boolean;
}
export interface IExperimentalOptions {
    flags?: {
        [key: string]: boolean;
    };
    anonymiseEventLog?: boolean;
    userGroups?: boolean;
    embedProxy?: boolean;
    batchMetrics?: boolean;
    dynamicFlags?: string[];
    externalResolver?: IExternalFlagsResolver;
}

export interface IUIFlags extends IFlags {
    ENABLE_DARK_MODE_SUPPORT?: boolean;
}

export interface IFlagContext {
    [key: string]: string;
}

export interface IFlagsResolver {
    getUIFlags: (context?: IFlagContext) => IUIFlags;
    isExperimentEnabled: (flagName: string, context?: IFlagContext) => boolean;
}

export interface IExternalFlagsResolver {
    isEnabled: (flagName: string, context?: IFlagContext) => boolean;
}
