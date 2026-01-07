import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

export const useSegmentLimits = (): {
    segmentValuesLimit: number;
    strategySegmentsLimit: number;
} => {
    const { uiConfig } = useUiConfig();

    return {
        segmentValuesLimit: uiConfig.resourceLimits.segmentValues,
        strategySegmentsLimit: uiConfig.resourceLimits.strategySegments,
    };
};
