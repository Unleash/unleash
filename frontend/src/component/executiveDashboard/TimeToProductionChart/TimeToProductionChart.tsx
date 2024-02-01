import { useMemo, type VFC } from 'react';
import 'chartjs-adapter-date-fns';
import { useTheme } from '@mui/material';
import {
    ExecutiveSummarySchema,
    ExecutiveSummarySchemaProjectFlagTrendsItem,
} from 'openapi';
import { LineChart } from '../LineChart/LineChart';
import { getRandomColor } from '../executive-dashboard-utils';
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
