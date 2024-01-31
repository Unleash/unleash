import { useMemo, type VFC } from 'react';
import 'chartjs-adapter-date-fns';
import { useTheme } from '@mui/material';
import { ExecutiveSummarySchema } from 'openapi';
import { LineChart } from '../LineChart/LineChart';
import { type ScriptableContext } from 'chart.js';

interface IUsersChartProps {
    userTrends: ExecutiveSummarySchema['userTrends'];
}

export const UsersChart: VFC<IUsersChartProps> = ({ userTrends }) => {
    const theme = useTheme();
    const data = useMemo(
        () => ({
            labels: userTrends.map((item) => item.date),
            datasets: [
                {
                    label: 'Total users',
                    data: userTrends.map((item) => item.total),
                    borderColor: theme.palette.primary.light,
                    backgroundColor: (context: ScriptableContext<'line'>) => {
                        const chart = context.chart;
                        const { ctx, chartArea } = chart;
                        if (!chartArea) {
                            return;
                        }
                        const gradient = ctx.createLinearGradient(
                            0,
                            chartArea.bottom,
                            0,
                            chartArea.top,
                        );
                        gradient.addColorStop(0, 'rgba(129, 122, 254, 0)');
                        gradient.addColorStop(1, 'rgba(129, 122, 254, 0.12)');
                        return gradient;
                    },
                    fill: true,
                    order: 3,
                },
                {
                    label: 'Active users',
                    data: userTrends.map((item) => item.active),
                    borderColor: theme.palette.success.border,
                    backgroundColor: theme.palette.success.border,
                    order: 2,
                },
                {
                    label: 'Inactive users',
                    data: userTrends.map((item) => item.inactive),
                    borderColor: theme.palette.warning.border,
                    backgroundColor: theme.palette.warning.border,
                    order: 1,
                },
            ],
        }),
        [theme, userTrends],
    );

    return <LineChart data={data} />;
};
