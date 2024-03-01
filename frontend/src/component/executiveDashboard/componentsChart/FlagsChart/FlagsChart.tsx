import { useMemo, type VFC } from 'react';
import 'chartjs-adapter-date-fns';
import { useTheme } from '@mui/material';
import { ExecutiveSummarySchema } from 'openapi';
import { LineChart, NotEnoughData } from '../../components/LineChart/LineChart';
import { usePlaceholderData } from 'component/executiveDashboard/hooks/usePlaceholderData';

interface IFlagsChartProps {
    flagTrends: ExecutiveSummarySchema['flagTrends'];
    isLoading?: boolean;
}

export const FlagsChart: VFC<IFlagsChartProps> = ({
    flagTrends,
    isLoading,
}) => {
    const theme = useTheme();
    const notEnoughData = flagTrends.length < 2;
    const placeholderData = usePlaceholderData({ fill: true, type: 'double' });

    const data = useMemo(
        () => ({
            labels: flagTrends.map((item) => item.date),
            datasets: [
                {
                    label: 'Total flags',
                    data: flagTrends.map((item) => item.total),
                    borderColor: theme.palette.primary.light,
                    backgroundColor: theme.palette.primary.light,
                },
                {
                    label: 'Stale',
                    data: flagTrends.map((item) => item.stale),
                    borderColor: theme.palette.warning.border,
                    backgroundColor: theme.palette.warning.border,
                },
            ],
        }),
        [theme, flagTrends],
    );

    return (
        <LineChart
            data={notEnoughData || isLoading ? placeholderData : data}
            cover={notEnoughData ? <NotEnoughData /> : isLoading}
        />
    );
};
