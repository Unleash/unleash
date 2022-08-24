import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { IUiConfig } from 'interfaces/uiConfig';

type IUseSegmentLimits = Pick<
    IUiConfig,
    'segmentValuesLimit' | 'strategySegmentsLimit'
>;

export const useSegmentLimits = (): IUseSegmentLimits => {
    const { uiConfig } = useUiConfig();

    return {
        segmentValuesLimit: uiConfig.segmentValuesLimit,
        strategySegmentsLimit: uiConfig.strategySegmentsLimit,
    };
};
