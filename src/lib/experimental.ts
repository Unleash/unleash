export interface IExperimentalOptions {
    metricsV2?: IExperimentalToggle;
    userGroups?: boolean;
    anonymiseEventLog?: boolean;
    embedProxy?: boolean;
    batchMetrics?: boolean;
}

export interface IExperimentalToggle {
    enabled: boolean;
}
