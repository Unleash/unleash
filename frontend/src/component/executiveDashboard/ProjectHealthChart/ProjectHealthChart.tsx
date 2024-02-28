import 'chartjs-adapter-date-fns';
import { type VFC } from 'react';
import { type ExecutiveSummarySchema } from 'openapi';
import { HealthTooltip } from './HealthChartTooltip/HealthChartTooltip';
import { LineChart } from '../LineChart/LineChart';
import { useProjectChartData } from '../useProjectChartData';

interface IFlagsProjectChartProps {
    projectFlagTrends: ExecutiveSummarySchema['projectFlagTrends'];
}

export const ProjectHealthChart: VFC<IFlagsProjectChartProps> = ({
    projectFlagTrends,
}) => {
    const data = useProjectChartData(projectFlagTrends);

    return (
        <LineChart
            data={data}
            isLocalTooltip
            TooltipComponent={HealthTooltip}
            overrideOptions={{
                parsing: { yAxisKey: 'health', xAxisKey: 'date' },
            }}
        />
    );
};
