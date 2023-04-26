import { ILocationSettings } from 'hooks/useLocationSettings';
import 'chartjs-adapter-date-fns';
import { ChartOptions, defaults } from 'chart.js';
import { IFeatureMetricsRaw } from 'interfaces/featureToggle';
import { formatDateHM } from 'utils/formatDate';
import { Theme } from '@mui/material/styles/createTheme';

export const createChartOptions = (
    theme: Theme,
    metrics: IFeatureMetricsRaw[],
    hoursBack: number,
    locationSettings: ILocationSettings
): ChartOptions<'line'> => {
    return {
        locale: locationSettings.locale,
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        color: theme.palette.text.secondary,
        plugins: {
            tooltip: {
                backgroundColor: theme.palette.background.paper,
                bodyColor: theme.palette.text.primary,
                titleColor: theme.palette.text.secondary,
                borderColor: theme.palette.primary.main,
                borderWidth: 1,
                padding: 10,
                boxPadding: 5,
                usePointStyle: true,
                callbacks: {
                    title: items =>
                        formatDateHM(
                            items[0].parsed.x,
                            locationSettings.locale
                        ),
                },
                // Sort tooltip items in the same order as the lines in the chart.
                itemSort: (a, b) => b.parsed.y - a.parsed.y,
            },
            legend: {
                position: 'top',
                align: 'end',
                labels: {
                    boxWidth: 10,
                    boxHeight: 10,
                    usePointStyle: true,
                },
            },
            title: {
                text: formatChartLabel(hoursBack),
                position: 'top',
                align: 'start',
                display: true,
                font: {
                    size: 16,
                    weight: '400',
                },
                color: theme.palette.text.primary,
            },
        },
        scales: {
            y: {
                type: 'linear',
                title: {
                    display: true,
                    text: 'Number of requests',
                    color: theme.palette.text.secondary,
                },
                // min: 0,
                suggestedMin: 0,
                ticks: { precision: 0, color: theme.palette.text.secondary },
                grid: {
                    color: theme.palette.divider,
                    borderColor: theme.palette.divider,
                },
            },
            x: {
                type: 'time',
                time: { unit: 'hour' },
                grid: { display: false },
                ticks: {
                    callback: (_, i, data) =>
                        formatDateHM(data[i].value, locationSettings.locale),
                    color: theme.palette.text.secondary,
                },
            },
        },
    };
};

const formatChartLabel = (hoursBack: number): string => {
    return hoursBack === 1
        ? 'Requests in the last hour'
        : `Requests in the last ${hoursBack} hours`;
};

// Set the default font for ticks, legends, tooltips, etc.
defaults.font = {
    ...defaults.font,
    family: 'Sen',
    size: 13,
    weight: '400',
};
