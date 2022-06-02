export interface IExperimentalOptions {
    metricsV2?: IExperimentalToggle;
    clientFeatureMemoize?: IExperimentalToggle;
    anonymiseEventLog?: boolean;
}

export interface IExperimentalToggle {
    enabled: boolean;
}
