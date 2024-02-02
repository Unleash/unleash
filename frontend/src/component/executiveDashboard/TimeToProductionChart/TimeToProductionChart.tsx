import { type VFC } from 'react';
import 'chartjs-adapter-date-fns';
import { ExecutiveSummarySchema } from 'openapi';
import { LineChart } from '../LineChart/LineChart';
import { useProjectChartData } from '../useProjectChartData';

interface IFlagsProjectChartProps {
    projectFlagTrends: ExecutiveSummarySchema['projectFlagTrends'];
}

export const TimeToProductionChart: VFC<IFlagsProjectChartProps> = ({
    projectFlagTrends,
}) => {
    const data = useProjectChartData(projectFlagTrends, 'timeToProduction');

    return <LineChart data={data} />;
};
