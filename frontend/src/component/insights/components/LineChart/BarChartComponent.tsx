import { useMemo, useState, type FC } from 'react';
import {
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    TimeScale,
    Filler,
    type ChartData,
    Chart,
    BarElement,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { useTheme } from '@mui/material';
import { useLocationSettings } from 'hooks/useLocationSettings';
import {
    ChartTooltip,
    ChartTooltipContainer,
    type TooltipState,
} from './ChartTooltip/ChartTooltip.tsx';
import { styled } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { createTooltip } from './createTooltip.ts';

const StyledContainer = styled('div')(({ theme }) => ({
    position: 'relative',
}));

const BarChartComponent: FC<{
    data: ChartData<'bar', unknown>;
    TooltipComponent?: ({
        tooltip,
    }: { tooltip: TooltipState | null }) => ReturnType<FC>;
}> = ({ data, TooltipComponent }) => {
    const theme = useTheme();
    const { locationSettings } = useLocationSettings();

    const [tooltip, setTooltip] = useState<null | TooltipState>(null);

    const options = useMemo(
        () => ({
            responsive: true,
            interaction: {
                mode: 'index' as const,
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'bottom' as const,
                    labels: {
                        color: theme.palette.text.secondary,
                        usePointStyle: true,
                        padding: 21,
                        boxHeight: 8,
                    },
                },
                tooltip: {
                    enabled: false,
                    position: 'average' as const,
                    external: createTooltip(setTooltip),
                },
            },
            locale: locationSettings.locale,
            scales: {
                x: {
                    type: 'time' as const,
                    display: true,
                    time: {
                        unit: 'week' as const,
                        tooltipFormat: 'PPP',
                    },
                    grid: {
                        display: false,
                    },
                },
                y: {
                    type: 'linear' as const,
                    position: 'left' as const,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of flags',
                    },
                },
            },
        }),
        [theme, locationSettings, setTooltip],
    );

    return (
        <StyledContainer>
            <Bar
                key={'chart'}
                options={options}
                data={data}
                height={100}
                width={250}
            />
            {TooltipComponent ? (
                <ChartTooltipContainer tooltip={tooltip}>
                    <TooltipComponent tooltip={tooltip} />
                </ChartTooltipContainer>
            ) : (
                <ChartTooltip tooltip={tooltip} />
            )}{' '}
        </StyledContainer>
    );
};

Chart.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    TimeScale,
    Tooltip,
    Legend,
    Filler,
);

// for lazy-loading
export default BarChartComponent;
