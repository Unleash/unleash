export interface IExperimentalOptions {
    metricsV2?: IExperimentalToggle;
    clientFeatureMemoize?: IExperimentalToggle;
    segments?: IExperimentalSegments;
}

export interface IExperimentalToggle {
    enabled: boolean;
}

export interface IExperimentalSegments {
    enableSegmentsClientApi: boolean;
    enableSegmentsAdminApi: boolean;
    inlineSegmentConstraints: boolean;
}

export const experimentalSegmentsConfig = (): IExperimentalSegments => {
    return {
        enableSegmentsAdminApi: true,
        enableSegmentsClientApi: true,
        inlineSegmentConstraints: true,
    };
};
