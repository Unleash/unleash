import { useMemo, useState, type VFC } from 'react';
import {
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    TimeScale,
    Chart,
    type ChartData,
    type ScatterDataPoint,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { Theme, useTheme } from '@mui/material';
import {
    useLocationSettings,
    type ILocationSettings,
} from 'hooks/useLocationSettings';
import { ChartTooltip, TooltipState } from './ChartTooltip/ChartTooltip';

const createOptions = (
    theme: Theme,
    locationSettings: ILocationSettings,
    setTooltip: React.Dispatch<React.SetStateAction<TooltipState | null>>,
) =>
    ({
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 12,
                    padding: 30,
                    generateLabels: (chart: Chart) => {
                        const datasets = chart.data.datasets;
                        const {
                            labels: {
                                usePointStyle,
                                pointStyle,
                                textAlign,
                                color,
                            },
                        } = chart?.legend?.options || {
                            labels: {},
                        };
                        return (chart as any)
                            ._getSortedDatasetMetas()
                            .map((meta: any) => {
                                const style = meta.controller.getStyle(
                                    usePointStyle ? 0 : undefined,
                                );
                                return {
                                    text: datasets[meta.index].label,
                                    fillStyle: style.backgroundColor,
                                    fontColor: color,
                                    hidden: !meta.visible,
                                    lineWidth: 0,
                                    borderRadius: 6,
                                    strokeStyle: style.borderColor,
                                    pointStyle: pointStyle || style.pointStyle,
                                    textAlign: textAlign || style.textAlign,
                                    datasetIndex: meta.index,
                                };
                            });
                    },
                },
            },
            tooltip: {
                enabled: false,
                external: (context: any) => {
                    const tooltipModel = context.tooltip;
                    if (tooltipModel.opacity === 0) {
                        setTooltip(null);
                        return;
                    }

                    const tooltip = context.tooltip;
                    setTooltip({
                        caretX: tooltip?.caretX,
                        caretY: tooltip?.caretY,
                        title: tooltip?.title?.join(' ') || '',
                        align: tooltip?.xAlign || 'left',
                        body:
                            tooltip?.body?.map((item: any, index: number) => ({
                                title: item?.lines?.join(' '),
                                color: tooltip?.labelColors?.[index]
                                    ?.borderColor,
                            })) || [],
                    });
                },
            },
        },
        locale: locationSettings.locale,
        interaction: {
            intersect: false,
            axis: 'x',
        },
        elements: {
            point: {
                radius: 0,
            },
        },
        // cubicInterpolationMode: 'monotone',
        color: theme.palette.text.secondary,
        scales: {
            y: {
                beginAtZero: true,
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
                    color: 'transparent',
                    borderColor: 'transparent',
                },
                ticks: {
                    color: theme.palette.text.secondary,
                },
            },
        },
    }) as const;

// Vertical line on the hovered chart, filled with gradient. Highlights a section of a chart when you hover over datapoints
const customHighlightPlugin = {
    id: 'customLine',
    afterDraw: (chart: Chart) => {
        const width = 26;
        if (chart.tooltip?.opacity && chart.tooltip.x) {
            const x = chart.tooltip.caretX;
            const yAxis = chart.scales.y;
            const ctx = chart.ctx;
            ctx.save();
            const gradient = ctx.createLinearGradient(
                x,
                yAxis.top,
                x,
                yAxis.bottom,
            );
            gradient.addColorStop(0, 'rgba(129, 122, 254, 0)');
            gradient.addColorStop(1, 'rgba(129, 122, 254, 0.12)');
            ctx.fillStyle = gradient;
            ctx.fillRect(
                x - width / 2,
                yAxis.top,
                width,
                yAxis.bottom - yAxis.top,
            );
            ctx.restore();
        }
    },
};

const LineChartComponent: VFC<{
    data: ChartData<'line', (number | ScatterDataPoint | null)[], unknown>;
}> = ({ data }) => {
    const theme = useTheme();
    const { locationSettings } = useLocationSettings();

    const [tooltip, setTooltip] = useState<null | TooltipState>(null);
    const options = useMemo(
        () => createOptions(theme, locationSettings, setTooltip),
        [theme, locationSettings],
    );

    return (
        <>
            <Line
                options={options}
                data={data}
                plugins={[customHighlightPlugin]}
            />
            <ChartTooltip tooltip={tooltip} />
        </>
    );
};

Chart.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    TimeScale,
    Tooltip,
    Legend,
);

// for lazy-loading
export default LineChartComponent;
