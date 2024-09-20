import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    type ChartOptions,
    Legend,
    LinearScale,
    Title,
    Tooltip,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Bar } from 'react-chartjs-2';
import type { Theme } from '@mui/material/styles/createTheme';
import useTheme from '@mui/material/styles/useTheme';
import { useMemo } from 'react';
import { formatTickValue } from 'component/common/Chart/formatTickValue';

const defaultYes = [
    45_000_000, 28_000_000, 28_000_000, 25_000_000, 50_000_000, 27_000_000,
    26_000_000, 50_000_000, 32_000_000, 12_000_000, 13_000_000, 31_000_000,
    12_000_000, 47_000_000, 29_000_000, 46_000_000, 45_000_000, 28_000_000,
    28_000_000, 25_000_000, 50_000_000, 27_000_000, 26_000_000, 50_000_000,
    32_000_000, 12_000_000, 13_000_000, 31_000_000, 12_000_000, 47_000_000,
];
const defaultNo = [
    5_000_000, 8_000_000, 3_000_000, 2_000_000, 2_000_000, 5_000_000, 9_000_000,
    3_000_000, 7_000_000, 2_000_000, 5_000_000, 8_000_000, 3_000_000, 2_000_000,
    2_000_000, 5_000_000, 1_000_000, 3_000_000, 12_000_000, 2_000_000,
    1_000_000, 1_000_000, 3_000_000, 2_000_000, 2_000_000, 5_000_000, 1_000_000,
    3_000_000, 8_000_000, 2_000_000,
];

const data = {
    labels: Array.from({ length: 30 }, (_, i) => i + 1),
    datasets: [
        {
            data: defaultYes,
            label: 'yes',
            backgroundColor: '#BEBEBE',
            hoverBackgroundColor: '#BEBEBE',
        },
        {
            data: defaultNo,
            label: 'no',
            backgroundColor: '#9A9A9A',
            hoverBackgroundColor: '#9A9A9A',
        },
    ],
};

const createBarChartOptions = (theme: Theme): ChartOptions<'bar'> => ({
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                color: theme.palette.text.primary,
                pointStyle: 'circle',
                usePointStyle: true,
                boxHeight: 6,
                padding: 15,
                boxPadding: 5,
            },
        },
        tooltip: {
            enabled: false,
        },
    },
    responsive: true,
    scales: {
        x: {
            stacked: true,
            ticks: {
                color: theme.palette.text.secondary,
            },
            grid: {
                display: false,
            },
        },
        y: {
            stacked: true,
            ticks: {
                color: theme.palette.text.secondary,
                maxTicksLimit: 5,
                callback: formatTickValue,
            },
            grid: {
                drawBorder: false,
            },
        },
    },
    elements: {
        bar: {
            borderRadius: 5,
        },
    },
    interaction: {
        mode: 'index',
        intersect: false,
    },
});

export const PlaceholderFlagMetricsChart = () => {
    const theme = useTheme();

    const options = useMemo(() => {
        return createBarChartOptions(theme);
    }, [theme]);

    return (
        <Bar
            data={data}
            options={options}
            aria-label='A bar chart with a single feature flag exposure metrics'
        />
    );
};

ChartJS.register(
    annotationPlugin,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
);
