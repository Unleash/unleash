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
import { Paper, Theme, Typography, useTheme } from '@mui/material';
import {
    useLocationSettings,
    type ILocationSettings,
} from 'hooks/useLocationSettings';
import { formatDateYMD } from 'utils/formatDate';
import { ExecutiveSummarySchema } from 'openapi';

const createData = (
    theme: Theme,
    flagsTrends: ExecutiveSummarySchema['flagsTrends'] = [],
) => ({
    labels: flagsTrends.map((item) => item.date),
    datasets: [
        {
            label: 'Total flags',
            data: flagsTrends.map((item) => item.total),
            borderColor: theme.palette.primary.main,
            backgroundColor: theme.palette.primary.main,
            fill: true,
        },
        {
            label: 'Archived flags',
            data: flagsTrends.map((item) => item.archived),
            borderColor: theme.palette.error.main,
            backgroundColor: theme.palette.error.main,
            fill: true,
        },
        {
            label: 'Active flags',
            data: flagsTrends.map((item) => item.active),
            borderColor: theme.palette.success.main,
            backgroundColor: theme.palette.success.main,
            fill: true,
        },
    ],
});

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

interface IFlagsChartComponentProps {
    flagsTrends: ExecutiveSummarySchema['flagsTrends'];
}

const FlagsChartComponent: VFC<IFlagsChartComponentProps> = ({
    flagsTrends,
}) => {
    const theme = useTheme();
    const { locationSettings } = useLocationSettings();
    const data = useMemo(
        () => createData(theme, flagsTrends),
        [theme, flagsTrends],
    );
    const options = createOptions(theme, locationSettings);

    return (
        <Paper sx={(theme) => ({ padding: theme.spacing(4) })}>
            <Typography
                variant='h3'
                sx={(theme) => ({ marginBottom: theme.spacing(3) })}
            >
                Number of flags
            </Typography>
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

export default FlagsChartComponent;
