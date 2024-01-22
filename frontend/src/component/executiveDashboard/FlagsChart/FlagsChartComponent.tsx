import { type VFC } from 'react';
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
import { mockData as usersMockData } from '../UsersChart/UsersChartComponent';

type Data = {
    date: string | Date;
    total?: number;
    active?: number;
    archived?: number;
}[];

const mockData: Data = usersMockData.map((item) => ({
    ...item,
    archived: item.inactive,
}));

const createData = (theme: Theme) => ({
    labels: mockData.map((item) => item.date),
    datasets: [
        {
            label: 'Total flags',
            data: mockData.map((item) => item.total),
            borderColor: theme.palette.primary.main,
            backgroundColor: theme.palette.primary.main,
            fill: true,
        },
        {
            label: 'Archived flags',
            data: mockData.map((item) => item.archived),
            borderColor: theme.palette.error.main,
            backgroundColor: theme.palette.error.main,
            fill: true,
        },
        {
            label: 'Active flags',
            data: mockData.map((item) => item.active),
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
            title: {
                text: 'Number of flags',
                position: 'top',
                align: 'start',
                display: true,
                font: {
                    size: 16,
                    weight: '400',
                },
                padding: {
                    bottom: 24,
                },
                color: theme.palette.text.primary,
            },
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

const FlagsChartComponent: VFC = () => {
    const theme = useTheme();
    const { locationSettings } = useLocationSettings();
    const data = createData(theme);
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

export default FlagsChartComponent;
