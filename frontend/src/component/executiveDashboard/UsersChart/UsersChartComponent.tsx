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
import faker from 'faker';
import { Paper, Theme, useTheme } from '@mui/material';
import {
    useLocationSettings,
    type ILocationSettings,
} from 'hooks/useLocationSettings';
import { formatDateYMD } from 'utils/formatDate';

type Data = {
    date: string | Date;
    total?: number;
    active?: number;
    inactive?: number;
}[];

const now = new Date();
const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
const mockStart = new Date(
    yearAgo.getFullYear(),
    yearAgo.getMonth() + 3,
    yearAgo.getDate(),
);
const mockLabels = Array.from({ length: 52 }, (_, i) => {
    const date = new Date(yearAgo.getTime() + i * 7 * 24 * 60 * 60 * 1000);

    return date.toISOString();
});

const mockData: Data = mockLabels.reduce((prev, curr) => {
    const date = new Date(curr);
    const key = date.toISOString().slice(0, 10);
    const lastValues = prev[prev.length - 1];

    if (date < mockStart) {
        return [...prev, { date: key }];
    }

    if (lastValues.total === undefined) {
        return [
            ...prev,
            {
                date: key,
                total: faker.datatype.number({ min: 15, max: 50 }),
                active: 0,
                inactive: 0,
            },
        ];
    }

    const total =
        lastValues.total + faker.datatype.number({ min: -10, max: 20 });

    const inactive =
        date < new Date(mockStart.getTime() + 2 * 30 * 24 * 60 * 60 * 1000)
            ? 0
            : Math.max(
                  0,
                  (lastValues.inactive || 0) +
                      faker.datatype.number({ min: -3, max: 5 }),
              );

    const active = total - inactive;

    return [...prev, { date: key, total, active, inactive }];
}, [] as Data);

const createData = (theme: Theme) => ({
    labels: mockData.map((item) => item.date),
    datasets: [
        {
            label: 'Active users',
            data: mockData.map((item) => item.total),
            borderColor: theme.palette.primary.main,
            backgroundColor: theme.palette.primary.main,
            fill: true,
        },
        {
            label: 'Inactive users',
            data: mockData.map((item) => item.inactive),
            borderColor: theme.palette.error.main,
            backgroundColor: theme.palette.error.main,
            fill: true,
        },
        {
            label: 'Active users',
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

const UsersChartComponent: VFC = () => {
    const theme = useTheme();
    const { locationSettings } = useLocationSettings();
    const data = createData(theme);
    const options = createOptions(theme, locationSettings);

    return (
        <Paper sx={(theme) => ({ padding: theme.spacing(4) })}>
            {/* <div>UsersChart</div> */}
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
