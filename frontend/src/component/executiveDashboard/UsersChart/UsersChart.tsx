import { useMemo, type VFC } from 'react';
import 'chartjs-adapter-date-fns';
import { useTheme } from '@mui/material';
import { ExecutiveSummarySchema } from 'openapi';
import { LineChart } from '../LineChart/LineChart';

interface IUsersChartProps {
    userTrends: ExecutiveSummarySchema['userTrends'];
}

export const UsersChart: VFC<IUsersChartProps> = ({
    userTrends,
}) => {
    const theme = useTheme();
    const data = useMemo(
        () => ({
            labels: userTrends.map((item) => item.date),
            datasets: [
                {
                    label: 'Total users',
                    data: userTrends.map((item) => item.total),
                    borderColor: theme.palette.primary.light,
                    backgroundColor: theme.palette.primary.light,
                    fill: true,
                },
                {
                    label: 'Active users',
                    data: userTrends.map((item) => item.active),
                    borderColor: theme.palette.success.border,
                    backgroundColor: theme.palette.success.border,
                },
                {
                    label: 'Inactive users',
                    data: userTrends.map((item) => item.inactive),
                    borderColor: theme.palette.warning.border,
                    backgroundColor: theme.palette.warning.border,
                },
            ],
        }),
        [theme, userTrends],
    );

    return <LineChart data={data} />;
};

