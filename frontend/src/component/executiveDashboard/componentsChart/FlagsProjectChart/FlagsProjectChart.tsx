import { useMemo, type VFC } from 'react';
import 'chartjs-adapter-date-fns';
import type { ExecutiveSummarySchema } from 'openapi';
import { LineChart, NotEnoughData } from '../../components/LineChart/LineChart';
import { useProjectChartData } from 'component/executiveDashboard/hooks/useProjectChartData';
import { usePlaceholderData } from 'component/executiveDashboard/hooks/usePlaceholderData';
import type { GroupedDataByProject } from '../../hooks/useGroupedProjectTrends';

interface IFlagsProjectChartProps {
    projectFlagTrends: GroupedDataByProject<
        ExecutiveSummarySchema['projectFlagTrends']
    >;
}

export const FlagsProjectChart: VFC<IFlagsProjectChartProps> = ({
    projectFlagTrends,
}) => {
    const placeholderData = usePlaceholderData({
        type: 'constant',
    });

    const data = useProjectChartData(projectFlagTrends);
    const notEnoughData = useMemo(
        () => (data.datasets.some((d) => d.data.length > 1) ? false : true),
        [data],
    );

    return (
        <LineChart
            data={notEnoughData ? placeholderData : data}
            isLocalTooltip
            overrideOptions={{
                parsing: {
                    yAxisKey: 'total',
                    xAxisKey: 'date',
                },
            }}
            cover={notEnoughData ? <NotEnoughData /> : false}
        />
    );
};
