import { useMemo, type VFC } from 'react';
import 'chartjs-adapter-date-fns';
import { useTheme } from '@mui/material';
import { ExecutiveSummarySchema } from 'openapi';
import { LineChart, NotEnoughData } from '../LineChart/LineChart';

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
    const placeholderData = useMemo(
        () => ({
            labels: Array.from({ length: 15 }, (_, i) => i + 1).map(
                (i) =>
                    new Date(Date.now() - (15 - i) * 7 * 24 * 60 * 60 * 1000),
            ),
            datasets: [
                {
                    label: 'Total flags',
                    data: [
                        43, 66, 55, 65, 62, 72, 75, 73, 80, 65, 62, 61, 69, 70,
                        77,
                    ],
                    borderColor: theme.palette.primary.light,
                    backgroundColor: theme.palette.primary.light,
                },
                {
                    label: 'Stale',
                    data: [3, 5, 4, 6, 2, 7, 5, 3, 8, 3, 5, 11, 8, 4, 3],
                    borderColor: theme.palette.warning.border,
                    backgroundColor: theme.palette.warning.border,
                },
            ],
        }),
        [theme],
    );

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
