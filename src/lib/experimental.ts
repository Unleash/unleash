export interface IExperimentalOptions {
    metricsV2?: IExperimentalToggle;
    clientFeatureMemoize?: IExperimentalToggle;
    userGroups?: boolean;
    anonymiseEventLog?: boolean;
}

export interface IExperimentalToggle {
    enabled: boolean;
}
