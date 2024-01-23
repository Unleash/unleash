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

type Data = {
    date: string | Date;
    total?: number;
    active?: number;
    inactive?: number;
}[];

export const mockData: Data = [
    {
        date: '2023-01-21',
    },
    {
        date: '2023-01-28',
    },
    {
        date: '2023-02-04',
    },
    {
        date: '2023-02-11',
    },
    {
        date: '2023-02-18',
    },
    {
        date: '2023-02-25',
    },
    {
        date: '2023-03-04',
    },
    {
        date: '2023-03-11',
    },
    {
        date: '2023-03-18',
    },
    {
        date: '2023-03-25',
    },
    {
        date: '2023-04-01',
    },
    {
        date: '2023-04-08',
    },
    {
        date: '2023-04-15',
    },
    {
        date: '2023-04-22',
        total: 43,
        active: 0,
        inactive: 0,
    },
    {
        date: '2023-04-29',
        total: 54,
        active: 54,
        inactive: 0,
    },
    {
        date: '2023-05-06',
        total: 63,
        active: 63,
        inactive: 0,
    },
    {
        date: '2023-05-13',
        total: 81,
        active: 81,
        inactive: 0,
    },
    {
        date: '2023-05-20',
        total: 80,
        active: 80,
        inactive: 0,
    },
    {
        date: '2023-05-27',
        total: 95,
        active: 95,
        inactive: 0,
    },
    {
        date: '2023-06-03',
        total: 108,
        active: 108,
        inactive: 0,
    },
    {
        date: '2023-06-10',
        total: 101,
        active: 101,
        inactive: 0,
    },
    {
        date: '2023-06-17',
        total: 104,
        active: 104,
        inactive: 0,
    },
    {
        date: '2023-06-24',
        total: 114,
        active: 114,
        inactive: 0,
    },
    {
        date: '2023-07-01',
        total: 108,
        active: 106,
        inactive: 2,
    },
    {
        date: '2023-07-08',
        total: 103,
        active: 102,
        inactive: 1,
    },
    {
        date: '2023-07-15',
        total: 106,
        active: 105,
        inactive: 1,
    },
    {
        date: '2023-07-22',
        total: 112,
        active: 106,
        inactive: 6,
    },
    {
        date: '2023-07-29',
        total: 113,
        active: 107,
        inactive: 6,
    },
    {
        date: '2023-08-05',
        total: 109,
        active: 98,
        inactive: 11,
    },
    {
        date: '2023-08-12',
        total: 110,
        active: 96,
        inactive: 14,
    },
    {
        date: '2023-08-19',
        total: 127,
        active: 111,
        inactive: 16,
    },
    {
        date: '2023-08-26',
        total: 140,
        active: 124,
        inactive: 16,
    },
    {
        date: '2023-09-02',
        total: 150,
        active: 130,
        inactive: 20,
    },
    {
        date: '2023-09-09',
        total: 168,
        active: 148,
        inactive: 20,
    },
    {
        date: '2023-09-16',
        total: 171,
        active: 154,
        inactive: 17,
    },
    {
        date: '2023-09-23',
        total: 190,
        active: 174,
        inactive: 16,
    },
    {
        date: '2023-09-30',
        total: 186,
        active: 169,
        inactive: 17,
    },
    {
        date: '2023-10-07',
        total: 188,
        active: 173,
        inactive: 15,
    },
    {
        date: '2023-10-14',
        total: 181,
        active: 166,
        inactive: 15,
    },
    {
        date: '2023-10-21',
        total: 192,
        active: 177,
        inactive: 15,
    },
    {
        date: '2023-10-28',
        total: 183,
        active: 164,
        inactive: 19,
    },
    {
        date: '2023-11-04',
        total: 200,
        active: 180,
        inactive: 20,
    },
    {
        date: '2023-11-11',
        total: 212,
        active: 189,
        inactive: 23,
    },
    {
        date: '2023-11-18',
        total: 204,
        active: 177,
        inactive: 27,
    },
    {
        date: '2023-11-25',
        total: 200,
        active: 173,
        inactive: 27,
    },
    {
        date: '2023-12-02',
        total: 200,
        active: 175,
        inactive: 25,
    },
    {
        date: '2023-12-09',
        total: 200,
        active: 176,
        inactive: 24,
    },
    {
        date: '2023-12-16',
        total: 215,
        active: 186,
        inactive: 29,
    },
    {
        date: '2023-12-23',
        total: 221,
        active: 195,
        inactive: 26,
    },
    {
        date: '2023-12-30',
        total: 214,
        active: 184,
        inactive: 30,
    },
    {
        date: '2024-01-06',
        total: 204,
        active: 173,
        inactive: 31,
    },
    {
        date: '2024-01-13',
        total: 215,
        active: 181,
        inactive: 34,
    },
];

const createData = (theme: Theme) => ({
    labels: mockData.map((item) => item.date),
    datasets: [
        {
            label: 'Total users',
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
