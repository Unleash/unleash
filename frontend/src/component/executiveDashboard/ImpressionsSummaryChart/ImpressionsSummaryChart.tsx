import { type VFC } from 'react';
import 'chartjs-adapter-date-fns';
import { ExecutiveSummarySchema } from 'openapi';
import { LineChart } from '../LineChart/LineChart';
import { useImpressionsSummaryData } from '../useImpressionsSummaryData';

interface IImpressionsSummaryChartProps {
    impressionsSummary: ExecutiveSummarySchema['impressionsSummary'];
}

export const ImpressionsSummaryChart: VFC<IImpressionsSummaryChartProps> = ({
    impressionsSummary,
}) => {
    const data = useImpressionsSummaryData(impressionsSummary, 'total');

    return <LineChart data={data} />;
};
