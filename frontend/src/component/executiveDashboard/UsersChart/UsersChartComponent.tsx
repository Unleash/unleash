import { useMemo, type VFC } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { Paper, Theme, useTheme } from '@mui/material';
import {
    useLocationSettings,
    type ILocationSettings,
} from 'hooks/useLocationSettings';
import { formatDateYMD } from 'utils/formatDate';
import { ExecutiveSummarySchema } from 'openapi';

const createOptions = (theme: Theme, locationSettings: ILocationSettings) =>
    ({
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
            },
            tooltip: {
                callbacks: {
                    title: (tooltipItems: any) => {
                        const item = tooltipItems?.[0];
                        const date =
                            item?.chart?.data?.labels?.[item.dataIndex];
                        return date
                            ? formatDateYMD(date, locationSettings.locale)
                            : '';
                    },
                },
            },
        },
        locale: locationSettings.locale,
        interaction: {
            intersect: false,
            axis: 'x',
        },
        color: theme.palette.text.secondary,
        scales: {
            y: {
                type: 'linear',
                grid: {
                    color: theme.palette.divider,
                    borderColor: theme.palette.divider,
                },
                ticks: { color: theme.palette.text.secondary },
            },
            x: {
                type: 'time',
                time: {
                    unit: 'month',
                },
                grid: {
                    color: theme.palette.divider,
                    borderColor: theme.palette.divider,
                },
                ticks: {
                    color: theme.palette.text.secondary,
                },
            },
        },
    }) as const;

interface IUsersChartComponentProps {
    userTrends: ExecutiveSummarySchema['userTrends'];
}

const createData = (
    theme: Theme,
    userTrends: ExecutiveSummarySchema['userTrends'],
) => ({
    labels: userTrends.map((item) => item.date),
    datasets: [
        {
            label: 'Total users',
            data: userTrends.map((item) => item.total),
            borderColor: theme.palette.primary.main,
            backgroundColor: theme.palette.primary.main,
            fill: true,
        },
        {
            label: 'Inactive users',
            data: userTrends.map((item) => item.inactive),
            borderColor: theme.palette.error.main,
            backgroundColor: theme.palette.error.main,
            fill: true,
        },
        {
            label: 'Active users',
            data: userTrends.map((item) => item.active),
            borderColor: theme.palette.success.main,
            backgroundColor: theme.palette.success.main,
            fill: true,
        },
    ],
});

const UsersChartComponent: VFC<IUsersChartComponentProps> = ({
    userTrends,
}) => {
    const theme = useTheme();
    const { locationSettings } = useLocationSettings();
    const data = useMemo(
        () => createData(theme, userTrends),
        [theme, userTrends],
    );

    const options = createOptions(theme, locationSettings);

    return (
        <Paper sx={(theme) => ({ padding: theme.spacing(4) })}>
            <Line options={options} data={data} />
        </Paper>
    );
};

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    TimeScale,
    Title,
    Tooltip,
    Legend,
);

export default UsersChartComponent;
