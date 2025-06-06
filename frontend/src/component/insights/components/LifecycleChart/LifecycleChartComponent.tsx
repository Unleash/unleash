import { type FC, useMemo } from 'react';
import {
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
    TimeScale,
    Chart,
    Filler,
    type ChartData,
    type ChartOptions,
    BarElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { type Theme, useTheme } from '@mui/material';
import { useLocationSettings } from 'hooks/useLocationSettings';
import merge from 'deepmerge';
import ChartDataLabels from 'chartjs-plugin-datalabels';

export const createOptions = (theme: Theme): ChartOptions<'bar'> => {
    const fontSize = 10;
    return {
        plugins: {
            legend: {
                position: 'right',
                maxWidth: 150,
                align: 'start',
                labels: {
                    color: theme.palette.text.secondary,
                    usePointStyle: true,
                    padding: 21,
                    boxHeight: 8,
                    font: {
                        size: fontSize,
                    },
                },
            },
            datalabels: {
                color: theme.palette.text.primary,
                font: {
                    weight: 'bold',
                    size: fontSize,
                },
                anchor: 'end',
                align: 'top',
                offset: -6,
            },
        },
        responsive: true,
        maintainAspectRatio: false,
        color: theme.palette.text.secondary,
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: theme.palette.divider,
                    borderColor: theme.palette.divider,
                    drawBorder: false,
                },
                ticks: {
                    stepSize: 1,
                    color: theme.palette.text.disabled,
                    font: {
                        size: fontSize,
                    },
                },
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: theme.palette.text.primary,
                    font: {
                        size: fontSize,
                    },
                },
            },
        },
    } as const;
};

function mergeAll<T>(objects: Partial<T>[]): T {
    return merge.all<T>(objects.filter((i) => i));
}

const LifecycleChartComponent: FC<{
    data: ChartData<'bar', unknown>;
    ariaLabel: string;
    ariaDescription?: string;
    overrideOptions?: ChartOptions<'bar'>;
}> = ({ data, ariaLabel, ariaDescription, overrideOptions }) => {
    const theme = useTheme();
    const { locationSettings } = useLocationSettings();

    const options = useMemo(
        () => mergeAll([createOptions(theme)]),
        [theme, locationSettings, overrideOptions],
    );

    return (
        <Bar
            options={options}
            data={data}
            aria-label={ariaLabel}
            aria-description={ariaDescription}
            plugins={[ChartDataLabels]}
        />
    );
};

Chart.register(
    CategoryScale,
    LinearScale,
    PointElement,
    BarElement,
    TimeScale,
    Tooltip,
    Legend,
    Filler,
);

// for lazy-loading
export default LifecycleChartComponent;
