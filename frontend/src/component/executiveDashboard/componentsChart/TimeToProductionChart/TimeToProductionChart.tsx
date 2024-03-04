import { type VFC } from 'react';
import 'chartjs-adapter-date-fns';
import { ExecutiveSummarySchema } from 'openapi';
import { LineChart } from '../../components/LineChart/LineChart';
import { useProjectChartData } from '../../hooks/useProjectChartData';

interface IFlagsProjectChartProps {
    projectFlagTrends: ExecutiveSummarySchema['projectFlagTrends'];
}

export const TimeToProductionChart: VFC<IFlagsProjectChartProps> = ({
    projectFlagTrends,
}) => {
    const data = useProjectChartData(projectFlagTrends);
    return (
        <LineChart
            data={data}
            isLocalTooltip
            overrideOptions={{
                parsing: {
                    yAxisKey: 'timeToProduction',
                    xAxisKey: 'date',
                },
            }}
        />
    );
};
