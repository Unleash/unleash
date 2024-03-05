import { Theme } from '@mui/material';
import { format, subMonths } from 'date-fns';
import { ILocationSettings } from 'hooks/useLocationSettings';
import { TooltipState } from './ChartTooltip/ChartTooltip';
import { createTooltip } from './createTooltip';
import { legendOptions } from './legendOptions';

export const createOptions = (
    theme: Theme,
    locationSettings: ILocationSettings,
    setTooltip: React.Dispatch<React.SetStateAction<TooltipState | null>>,
    isPlaceholder?: boolean,
    localTooltip?: boolean,
) =>
    ({
        responsive: true,
        ...(isPlaceholder
            ? {
                  animation: {
                      duration: 0,
                  },
              }
            : {}),
        plugins: {
            legend: {
                ...legendOptions,
                display: !isPlaceholder,
            },
            tooltip: {
                enabled: false,
                external: createTooltip(setTooltip),
            },
        },
        locale: locationSettings.locale,
        interaction: {
            intersect: localTooltip || false,
            axis: 'x',
        },
        elements: {
            point: {
                radius: 0,
                hitRadius: 15,
            },
        },
        // cubicInterpolationMode: 'monotone',
        tension: 0.1,
        color: theme.palette.text.secondary,
        scales: {
            y: {
                beginAtZero: true,
                type: 'linear',
                grid: {
                    color: theme.palette.divider,
                    borderColor: theme.palette.divider,
                },
                ticks: {
                    color: theme.palette.text.secondary,
                    display: !isPlaceholder,
                    precision: 0,
                },
            },
            x: {
                type: 'time',
                time: {
                    unit: 'week',
                    tooltipFormat: 'PPP',
                },
                grid: {
                    color: 'transparent',
                    borderColor: 'transparent',
                },
                ticks: {
                    color: theme.palette.text.secondary,
                    display: !isPlaceholder,
                    source: 'data',
                    maxRotation: 90,
                    minRotation: 23.5,
                },
                min: format(subMonths(new Date(), 3), 'yyyy-MM-dd'),
            },
        },
    }) as const;
