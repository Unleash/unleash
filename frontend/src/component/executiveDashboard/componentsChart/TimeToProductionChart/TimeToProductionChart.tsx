import { useMemo, type VFC } from 'react';
import 'chartjs-adapter-date-fns';
import type { ExecutiveSummarySchema } from 'openapi';
import { LineChart } from '../../components/LineChart/LineChart';
import { useProjectChartData } from '../../hooks/useProjectChartData';
import type { GroupedDataByProject } from '../../hooks/useGroupedProjectTrends';
import { usePlaceholderData } from '../../hooks/usePlaceholderData';
import { TimeToProductionTooltip } from './TimeToProductionTooltip/TimeToProductionTooltip';

interface ITimeToProductionChartProps {
    projectFlagTrends: GroupedDataByProject<
        ExecutiveSummarySchema['projectFlagTrends']
    >;
}

export const TimeToProductionChart: VFC<ITimeToProductionChartProps> = ({
    projectFlagTrends,
}) => {
    const data = useProjectChartData(projectFlagTrends);
    const notEnoughData = useMemo(
        () => !data.datasets.some((d) => d.data.length > 1),
        [data],
    );

    const placeholderData = usePlaceholderData();
    return (
        <LineChart
            data={notEnoughData ? placeholderData : data}
            isLocalTooltip
            TooltipComponent={TimeToProductionTooltip}
            overrideOptions={{
                parsing: {
                    yAxisKey: 'timeToProduction',
                    xAxisKey: 'date',
                },
            }}
        />
    );
};
