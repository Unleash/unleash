import 'chartjs-adapter-date-fns';
import { type FC, useMemo, useState } from 'react';
import type { InstanceInsightsSchema } from 'openapi';
import { useProjectChartData } from 'component/insights/hooks/useProjectChartData';
import { useTheme } from '@mui/material';
import type { GroupedDataByProject } from 'component/insights/hooks/useGroupedProjectTrends';
import { usePlaceholderData } from 'component/insights/hooks/usePlaceholderData';
import { Chart } from 'react-chartjs-2';
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
import {
    ChartTooltip,
    type TooltipState,
} from 'component/insights/components/LineChart/ChartTooltip/ChartTooltip';
import { createTooltip } from 'component/insights/components/LineChart/createTooltip';
import { CreationArchiveTooltip } from './CreationArchiveTooltip.tsx';
import { CreationArchiveRatioTooltip } from './CreationArchiveRatioTooltip.tsx';
import { getFlagTypeColors } from './flagTypeColors.ts';
import type { WeekData, RawWeekData } from './types.ts';

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

        const allFlagTypes = new Set<string>();
        creationVsArchivedChart.datasets.forEach((d) =>
            d.data.forEach((item: any) => {
                if (item.createdFlags) {
                    Object.keys(item.createdFlags).forEach((type) =>
                        allFlagTypes.add(type),
                    );
                }
            }),
        );

        const aggregateWeekData = (acc: WeekData, item: RawWeekData) => {
            if (item) {
                acc.archivedFlags += item.archivedFlags || 0;

                if (item.createdFlags) {
                    Object.entries(item.createdFlags).forEach(
                        ([type, count]) => {
                            acc.createdFlagsByType[type] =
                                (acc.createdFlagsByType[type] || 0) + count;
                            acc.totalCreatedFlags += count;
                        },
                    );
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
            createdFlagsByType: {},
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

        const flagTypeColors = getFlagTypeColors(theme);

        const flagTypeDatasets = Array.from(allFlagTypes).map(
            (flagType, index) => ({
                label: flagType,
                data: weeks,
                backgroundColor: flagTypeColors[index % flagTypeColors.length],
                borderColor: flagTypeColors[index % flagTypeColors.length],
                type: 'bar' as const,
                parsing: {
                    yAxisKey: `createdFlagsByType.${flagType}`,
                    xAxisKey: 'date',
                },
                yAxisID: 'y',
                stack: 'created',
                order: 2,
            }),
        );

        const flagTypeNames = Array.from(allFlagTypes);

        return {
            datasets: [
                {
                    label: 'Archived flags',
                    data: weeks,
                    backgroundColor: theme.palette.neutral.border,
                    borderColor: theme.palette.neutral.border,
                    parsing: { yAxisKey: 'archivedFlags', xAxisKey: 'date' },
                    order: 2,
                },
                ...flagTypeDatasets,
                {
                    label: 'Flags archived / Flags created',
                    data: weeks,
                    borderColor: theme.palette.primary.light,
                    backgroundColor: theme.palette.primary.light,
                    type: 'line' as const,
                    parsing: {
                        yAxisKey: 'archivePercentage',
                        xAxisKey: 'date',
                    },
                    yAxisID: 'y1',
                    order: 1,
                },
            ],
            flagTypeNames,
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

    const flagTypeNames = aggregateOrProjectData.flagTypeNames || [];

    return (
        <>
            <Chart
                type='bar'
                data={data}
                options={{
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom' as const,
                            labels: {
                                color: theme.palette.text.secondary,
                                usePointStyle: true,
                                padding: 21,
                                boxHeight: 8,
                                filter: (legendItem) => {
                                    return !flagTypeNames.includes(
                                        legendItem.text || '',
                                    );
                                },
                                generateLabels: (chart) => {
                                    const original =
                                        ChartJS.defaults.plugins.legend.labels.generateLabels(
                                            chart,
                                        );
                                    const filtered = original.filter(
                                        (item) =>
                                            !flagTypeNames.includes(
                                                item.text || '',
                                            ),
                                    );

                                    filtered.push({
                                        text: 'Created Flags',
                                        fillStyle: theme.palette.success.main,
                                        strokeStyle: theme.palette.success.main,
                                        lineWidth: 0,
                                        hidden: false,
                                        index: filtered.length,
                                        datasetIndex: -1,
                                    });

                                    return filtered;
                                },
                            },
                        },
                        tooltip: {
                            enabled: false,
                            position: 'nearest',
                            external: createTooltip(setTooltip),
                        },
                    },
                    locale: locationSettings.locale,
                    scales: {
                        x: {
                            type: 'time',
                            display: true,
                            time: {
                                unit: 'week',
                                tooltipFormat: 'PPP',
                            },
                            grid: {
                                display: false,
                            },
                        },
                        y: {
                            type: 'linear',
                            position: 'left',
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Number of flags',
                            },
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Ratio',
                            },
                            grid: {
                                drawOnChartArea: false,
                            },
                            ticks: {
                                callback: (value) => `${value}%`,
                            },
                        },
                    },
                }}
                height={100}
                width={250}
            />
            {tooltip?.dataPoints?.some(
                (point) =>
                    point.dataset.label !== 'Archived flags' &&
                    point.dataset.label !== 'Flags archived / Flags created',
            ) ? (
                <CreationArchiveTooltip tooltip={tooltip} />
            ) : tooltip?.dataPoints?.some(
                  (point) =>
                      point.dataset.label === 'Flags archived / Flags created',
              ) ? (
                <CreationArchiveRatioTooltip tooltip={tooltip} />
            ) : (
                <ChartTooltip tooltip={tooltip} />
            )}
        </>
    );
};
