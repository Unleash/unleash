import { useMemo, type VFC } from 'react';
import 'chartjs-adapter-date-fns';
import type { InstanceInsightsSchema } from 'openapi';
import {
    LineChart,
    NotEnoughData,
} from 'component/insights/components/LineChart/LineChart';
import { useProjectChartData } from 'component/insights/hooks/useProjectChartData';
import { usePlaceholderData } from 'component/insights/hooks/usePlaceholderData';
import type { GroupedDataByProject } from 'component/insights/hooks/useGroupedProjectTrends';

interface IFlagsProjectChartProps {
    projectFlagTrends: GroupedDataByProject<
        InstanceInsightsSchema['projectFlagTrends']
    >;
    isLoading?: boolean;
}

export const FlagsProjectChart: VFC<IFlagsProjectChartProps> = ({
    projectFlagTrends,
    isLoading,
}) => {
    const placeholderData = usePlaceholderData({
        type: 'constant',
    });

    const data = useProjectChartData(projectFlagTrends);
    const notEnoughData = useMemo(
        () => !isLoading && !data.datasets.some((d) => d.data.length > 1),
        [data, isLoading],
    );

    return (
        <LineChart
            data={notEnoughData || isLoading ? placeholderData : data}
            overrideOptions={{
                parsing: {
                    yAxisKey: 'total',
                    xAxisKey: 'date',
                },
            }}
            cover={notEnoughData ? <NotEnoughData /> : isLoading}
        />
    );
};
