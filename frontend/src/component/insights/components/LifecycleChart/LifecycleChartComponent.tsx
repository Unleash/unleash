import { type ReactNode, useState, type FC, useMemo } from 'react';
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
import {
    ChartTooltip,
    type TooltipState,
} from '../LineChart/ChartTooltip/ChartTooltip.tsx';
import ChartDataLabels from 'chartjs-plugin-datalabels';

export const createOptions = (
    theme: Theme,
    // locationSettings: ILocationSettings,
    // setTooltip: React.Dispatch<React.SetStateAction<TooltipState | null>>,
    isPlaceholder?: boolean,
): ChartOptions<'bar'> => {
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
        aspectRatio: 2 / 1,
        responsive: true,
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
    aspectRatio?: number;
    cover?: ReactNode;
    overrideOptions?: ChartOptions<'bar'>;
    TooltipComponent?: ({
        tooltip,
    }: { tooltip: TooltipState | null }) => ReturnType<FC>;
}> = ({
    data,
    aspectRatio = 2.5,
    cover,
    overrideOptions,
    TooltipComponent,
}) => {
    const theme = useTheme();
    const { locationSettings } = useLocationSettings();

    const [tooltip, setTooltip] = useState<null | TooltipState>(null);

    const options = useMemo(
        () => mergeAll([createOptions(theme)]),
        [theme, locationSettings, overrideOptions, cover],
    );

    return (
        <>
            <Bar
                key={cover ? 'cover' : 'chart'}
                options={options}
                data={data}
                plugins={[ChartDataLabels]}
                height={100}
                width={100 * aspectRatio}
            />
            <ChartTooltip tooltip={tooltip} />
        </>
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
