import { lazy } from 'react';
import type { ScriptableContext } from 'chart.js';
import { Typography } from '@mui/material';

export const LineChart = lazy(() => import('./LineChartComponent.tsx'));

export const fillGradient =
    (a: string, b: string) => (context: ScriptableContext<'line'>) => {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        if (!chartArea) {
            return;
        }
        const gradient = ctx.createLinearGradient(
            0,
            chartArea.bottom,
            0,
            chartArea.top,
        );
        gradient.addColorStop(0, a);
        gradient.addColorStop(1, b);
        return gradient;
    };

export const fillGradientPrimary = fillGradient(
    'rgba(129, 122, 254, 0)',
    'rgba(129, 122, 254, 0.12)',
);

export const NotEnoughData = ({
    title = 'Not enough data',
    description = 'Two or more weeks of data are needed to show a chart.',
}) => (
    <>
        <Typography
            variant='body1'
            component='h4'
            sx={(theme) => ({
                paddingBottom: theme.spacing(1),
            })}
        >
            {title}
        </Typography>
        <Typography variant='body2'>{description}</Typography>
    </>
);
