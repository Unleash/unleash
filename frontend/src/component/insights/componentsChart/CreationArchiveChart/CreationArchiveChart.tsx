import 'chartjs-adapter-date-fns';
import { type FC, useMemo, useState } from 'react';
import type { InstanceInsightsSchema } from 'openapi';
import { useProjectChartData } from 'component/insights/hooks/useProjectChartData';
import { useTheme } from '@mui/material';
import type { GroupedDataByProject } from 'component/insights/hooks/useGroupedProjectTrends';
import { usePlaceholderData } from 'component/insights/hooks/usePlaceholderData';
import {
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Tooltip,
    Legend,
    TimeScale,
    Chart as ChartJS,
    Filler,
} from 'chart.js';
import { useLocationSettings } from 'hooks/useLocationSettings';
import type { TooltipState } from 'component/insights/components/LineChart/ChartTooltip/ChartTooltip';
import type { WeekData, RawWeekData } from './types.ts';
import { createTooltip } from 'component/insights/components/LineChart/createTooltip.ts';
import { CreationArchiveRatioTooltip } from './CreationArchiveRatioTooltip.tsx';
import { Chart } from 'react-chartjs-2';
import { getDateFnsLocale } from '../../getDateFnsLocale.ts';

ChartJS.register(
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

interface ICreationArchiveChartProps {
    creationArchiveTrends: GroupedDataByProject<
        InstanceInsightsSchema['creationArchiveTrends']
    >;
    isLoading?: boolean;
}

// Vertical line on the hovered chart, filled with gradient. Highlights a section of a chart when you hover over datapoints
const customHighlightPlugin = {
    id: 'customLine',
    afterDraw: (chart: ChartJS) => {
        const defaultCategoryPercentage = 0.8;
        const width =
            (chart.width / chart.scales.x.ticks.length) *
            (chart.options.datasets?.bar?.categoryPercentage ??
                defaultCategoryPercentage);
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

export const CreationArchiveChart: FC<ICreationArchiveChartProps> = ({
    creationArchiveTrends,
    isLoading,
}) => {
    const creationVsArchivedChart = useProjectChartData(creationArchiveTrends);
    const theme = useTheme();
    const placeholderData = usePlaceholderData();
    const { locationSettings } = useLocationSettings();
    const [tooltip, setTooltip] = useState<null | TooltipState>(null);

    const aggregateOrProjectData = useMemo(() => {
        const labels: string[] = Array.from(
            new Set(
                creationVsArchivedChart.datasets.flatMap((d) =>
                    d.data.map((item) => item.week),
                ),
            ),
        );

        const aggregateWeekData = (acc: WeekData, item: RawWeekData) => {
            if (item) {
                acc.archivedFlags += item.archivedFlags || 0;

                if (item.createdFlags) {
                    Object.entries(item.createdFlags).forEach(([_, count]) => {
                        acc.totalCreatedFlags += count;
                    });
                }
            }
            if (!acc.date) {
                acc.date = item?.date;
            }
            return acc;
        };

        const createInitialWeekData = (label: string): WeekData => ({
            archivedFlags: 0,
            totalCreatedFlags: 0,
            archivePercentage: 0,
            week: label,
        });

        const weeks: WeekData[] = labels
            .map((label) => {
                return creationVsArchivedChart.datasets
                    .map((d) => d.data.find((item) => item.week === label))
                    .reduce(aggregateWeekData, createInitialWeekData(label));
            })
            .map((week) => ({
                ...week,
                archivePercentage:
                    week.totalCreatedFlags > 0
                        ? (week.archivedFlags / week.totalCreatedFlags) * 100
                        : 0,
            }))
            .sort((a, b) => (a.week > b.week ? 1 : -1));

        return {
            datasets: [
                {
                    label: 'Flags archived',
                    data: weeks,
                    backgroundColor: theme.palette.charts.A2,
                    borderColor: theme.palette.charts.A2,
                    hoverBackgroundColor: theme.palette.charts.A2,
                    hoverBorderColor: theme.palette.charts.A2,
                    parsing: { yAxisKey: 'archivedFlags', xAxisKey: 'date' },
                    order: 1,
                },
                {
                    label: 'Flags created',
                    data: weeks,
                    backgroundColor: theme.palette.charts.A1,
                    borderColor: theme.palette.charts.A1,
                    hoverBackgroundColor: theme.palette.charts.A1,
                    hoverBorderColor: theme.palette.charts.A1,
                    parsing: {
                        yAxisKey: 'totalCreatedFlags',
                        xAxisKey: 'date',
                    },
                    order: 2,
                },
            ],
        };
    }, [creationVsArchivedChart, theme]);

    const notEnoughData = useMemo(
        () =>
            !isLoading &&
            !creationVsArchivedChart.datasets.some((d) => d.data.length > 1),
        [creationVsArchivedChart, isLoading],
    );
    const data =
        notEnoughData || isLoading ? placeholderData : aggregateOrProjectData;

    const options = useMemo(
        () => ({
            responsive: true,
            interaction: {
                mode: 'index' as const,
                intersect: false,
            },
            datasets: { bar: { borderRadius: 4 } },
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
                    adapters: {
                        date: {
                            locale: getDateFnsLocale(locationSettings.locale),
                        },
                    },
                    type: 'time' as const,
                    display: true,
                    time: {
                        unit: 'week' as const,
                        tooltipFormat: 'P',
                    },
                    grid: {
                        display: false,
                    },
                    ticks: { source: 'data' },
                },
                y: {
                    type: 'linear' as const,
                    position: 'left' as const,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of flags',
                    },
                    ticks: {
                        stepSize: 1,
                    },
                },
            },
        }),
        [theme, locationSettings, setTooltip],
    );

    return (
        <>
            <Chart
                type='bar'
                data={data}
                options={options}
                height={100}
                width={250}
                plugins={[customHighlightPlugin]}
            />
            <CreationArchiveRatioTooltip tooltip={tooltip} />
        </>
    );
};
