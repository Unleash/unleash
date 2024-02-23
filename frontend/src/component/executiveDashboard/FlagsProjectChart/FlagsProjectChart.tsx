import { type VFC } from 'react';
import 'chartjs-adapter-date-fns';
import { ExecutiveSummarySchema } from 'openapi';
import { LineChart } from '../LineChart/LineChart';
import { useProjectChartData } from '../useProjectChartData';

interface IFlagsProjectChartProps {
    projectFlagTrends: ExecutiveSummarySchema['projectFlagTrends'];
}

export const FlagsProjectChart: VFC<IFlagsProjectChartProps> = ({
    projectFlagTrends,
}) => {
    const data = useProjectChartData(projectFlagTrends, 'total');

    return <LineChart data={data} isLocalTooltip />;
};
