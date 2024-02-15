import { type ReactNode, useMemo, useState, type VFC } from 'react';
import {
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    TimeScale,
    Chart,
    Filler,
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
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { styled } from '@mui/material';

const createOptions = (
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
                display: !isPlaceholder,
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
                    const tooltip = context.tooltip;
                    if (tooltip.opacity === 0) {
                        setTooltip(null);
                        return;
                    }

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
                    unit: 'month',
                },
                grid: {
                    color: 'transparent',
                    borderColor: 'transparent',
                },
                ticks: {
                    color: theme.palette.text.secondary,
                    display: !isPlaceholder,
                },
            },
        },
    }) as const;

const StyledContainer = styled('div')(({ theme }) => ({
    position: 'relative',
}));

const StyledCover = styled('div')(({ theme }) => ({
    position: 'absolute',
    inset: 0,
    display: 'flex',
    zIndex: theme.zIndex.appBar,
    '&::before': {
        zIndex: theme.zIndex.fab,
        content: '""',
        position: 'absolute',
        inset: 0,
        backgroundColor: theme.palette.background.paper,
        opacity: 0.8,
    },
}));

const StyledCoverContent = styled('div')(({ theme }) => ({
    zIndex: theme.zIndex.modal,
    margin: 'auto',
    color: theme.palette.text.secondary,
    textAlign: 'center',
}));

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
    aspectRatio?: number;
    cover?: ReactNode;
    isLocalTooltip?: boolean;
}> = ({ data, aspectRatio, cover, isLocalTooltip }) => {
    const theme = useTheme();
    const { locationSettings } = useLocationSettings();

    const [tooltip, setTooltip] = useState<null | TooltipState>(null);
    const options = useMemo(
        () =>
            createOptions(
                theme,
                locationSettings,
                setTooltip,
                Boolean(cover),
                isLocalTooltip,
            ),
        [theme, locationSettings],
    );

    return (
        <StyledContainer>
            <Line
                options={options}
                data={data}
                plugins={[customHighlightPlugin]}
                height={aspectRatio ? 100 : undefined}
                width={aspectRatio ? 100 * aspectRatio : undefined}
            />
            <ConditionallyRender
                condition={!cover}
                show={<ChartTooltip tooltip={tooltip} />}
                elseShow={
                    <StyledCover>
                        <StyledCoverContent>
                            {cover !== true ? cover : ' '}
                        </StyledCoverContent>
                    </StyledCover>
                }
            />
        </StyledContainer>
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
    Filler,
);

// for lazy-loading
export default LineChartComponent;
