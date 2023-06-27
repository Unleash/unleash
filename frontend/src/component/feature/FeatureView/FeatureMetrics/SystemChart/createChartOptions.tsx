import { ILocationSettings } from 'hooks/useLocationSettings';
import 'chartjs-adapter-date-fns';
import { ChartOptions, defaults } from 'chart.js';
import { IFeatureMetricsRaw } from 'interfaces/featureToggle';
import { formatDateHM } from 'utils/formatDate';
import { Theme } from '@mui/material/styles/createTheme';
import { IPoint } from './createChartData';

const formatVariantEntry = (
    variant: [string, number],
    totalExposure: number
) => {
    if (totalExposure === 0) return '';
    const [key, value] = variant;
    const percentage = Math.floor((Number(value) / totalExposure) * 100);
    return `${value} (${percentage}%) - ${key}`;
};

const EventIndicator = ({ x, y, label, color }) => (
    <div style={{ position: 'absolute', left: x, top: y, textAlign: 'center' }}>
        <div
            style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: color,
            }}
        />
        <span style={{ fontSize: 12, marginTop: -15 }}>{label}</span>
    </div>
);

export const createChartOptions = (
    theme: Theme,
    metrics: IFeatureMetricsRaw[],
    hoursBack: number,
    locationSettings: ILocationSettings
): any => {
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
                itemSort: (a, b) => {
                    const order = ['Exposed', 'Not exposed'];
                    const aIndex = order.indexOf(a.dataset.label!);
                    const bIndex = order.indexOf(b.dataset.label!);
                    return aIndex - bIndex;
                },
                callbacks: {
                    label: item => {
                        return `${item.formattedValue} - ${item.dataset.label}`;
                    },
                    title: items =>
                        `Time: ${formatDateHM(
                            items[0].parsed.x,
                            locationSettings.locale
                        )}`,
                },
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
                // text: formatChartLabel(hoursBack),
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
                    text: 'CPU(%)',
                    color: theme.palette.text.secondary,
                },
                stackWeight: 4,
                stack: 'demo',
                suggestedMin: 0,
                ticks: { precision: 0, color: theme.palette.text.secondary },
                grid: {
                    color: theme.palette.divider,
                    borderColor: theme.palette.divider,
                },
            },
            y3: {
                type: 'category',
                labels: ['CHANGED'],
                offset: true,
                position: 'left',
                stack: 'demo',
                suggestedMin: 0,
                stackWeight: 1,
                showLine: false,
            },
            y2: {
                type: 'linear',
                position: 'right',
                title: {
                    display: true,
                    text: 'Memory (MB)',
                    color: theme.palette.text.secondary,
                },
                stackWeight: 4,
                weight: 1,
                stack: 'rightStack',
                // min: 0,
                suggestedMin: 0,
                ticks: { precision: 0, color: theme.palette.text.secondary },
                grid: {
                    display: false,
                },
            },
            y4: {
                type: 'category',
                labels: ['CHANGED'],
                showLine: false,
                offset: true,
                position: 'right',
                stack: 'rightStack',
                stackWeight: 1,
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
