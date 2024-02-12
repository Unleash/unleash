import { useMemo, type VFC } from 'react';
import 'chartjs-adapter-date-fns';
import { useTheme } from '@mui/material';
import { ExecutiveSummarySchema } from 'openapi';
import { LineChart } from '../LineChart/LineChart';

interface IFlagsChartProps {
    flagTrends: ExecutiveSummarySchema['flagTrends'];
}

export const FlagsChart: VFC<IFlagsChartProps> = ({ flagTrends }) => {
    const theme = useTheme();
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

    return <LineChart data={data} />;
};
