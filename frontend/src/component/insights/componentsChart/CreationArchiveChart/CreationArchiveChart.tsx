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
    isAggregate?: boolean;
    isLoading?: boolean;
}

type WeekData = {
    archivedFlags: number;
    totalCreatedFlags: number;
    createdFlagsByType: Record<string, number>;
    archivePercentage: number;
    week: string;
    date?: string;
};

type RawWeekData = {
    archivedFlags: number;
    createdFlags: Record<string, number>;
    week: string;
    date: string;
};

export const CreationArchiveChart: FC<ICreationArchiveChartProps> = ({
    creationArchiveTrends,
    isAggregate,
    isLoading,
}) => {
    const creationArchiveData = useProjectChartData(creationArchiveTrends);
    const theme = useTheme();
    const placeholderData = usePlaceholderData();
    const { locationSettings } = useLocationSettings();
    const [tooltip, setTooltip] = useState<null | TooltipState>(null);

    const aggregateHealthData = useMemo(() => {
        const labels: string[] = Array.from(
            new Set(
                creationArchiveData.datasets.flatMap((d) =>
                    d.data.map((item) => item.week),
                ),
            ),
        );

        // Get all unique flag types
        const allFlagTypes = new Set<string>();
        creationArchiveData.datasets.forEach((d) =>
            d.data.forEach((item: any) => {
                if (item.createdFlags) {
                    Object.keys(item.createdFlags).forEach((type) =>
                        allFlagTypes.add(type),
                    );
                }
            }),
        );

        const weeks: WeekData[] = labels
            .map((label) => {
                return creationArchiveData.datasets
                    .map((d) => d.data.find((item) => item.week === label))
                    .reduce(
                        (acc: WeekData, item: RawWeekData) => {
                            if (item) {
                                acc.archivedFlags += item.archivedFlags || 0;

                                if (item.createdFlags) {
                                    Object.entries(item.createdFlags).forEach(
                                        ([type, count]) => {
                                            acc.createdFlagsByType[type] =
                                                (acc.createdFlagsByType[type] ||
                                                    0) + count;
                                            acc.totalCreatedFlags += count;
                                        },
                                    );
                                }
                            }
                            if (!acc.date) {
                                acc.date = item?.date;
                            }
                            return acc;
                        },
                        {
                            archivedFlags: 0,
                            totalCreatedFlags: 0,
                            createdFlagsByType: {},
                            archivePercentage: 0,
                            week: label,
                        } as WeekData,
                    );
            })
            .map((week) => ({
                ...week,
                archivePercentage:
                    week.totalCreatedFlags > 0
                        ? (week.archivedFlags / week.totalCreatedFlags) * 100
                        : 0,
            }))
            .sort((a, b) => (a.week > b.week ? 1 : -1));

        // Create datasets for each flag type
        const flagTypeColors = [
            theme.palette.success.border,
            theme.palette.success.main,
            theme.palette.success.dark,
            '#4D8007',
            '#7D935E',
        ];

        const flagTypeDatasets = Array.from(allFlagTypes).map(
            (flagType, index) => ({
                label: `Created: ${flagType}`,
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

        return {
            datasets: [
                {
                    label: 'Archived flags',
                    data: weeks,
                    backgroundColor: theme.palette.background.application,
                    borderColor: theme.palette.background.application,
                    type: 'bar' as const,
                    parsing: { yAxisKey: 'archivedFlags', xAxisKey: 'date' },
                    yAxisID: 'y',
                    stack: 'archived',
                    order: 2,
                },
                ...flagTypeDatasets,
                {
                    label: 'Flags archived / Flags created',
                    data: weeks,
                    borderColor: theme.palette.primary.light,
                    backgroundColor: theme.palette.primary.light,
                    fill: false,
                    type: 'line' as const,
                    parsing: {
                        yAxisKey: 'archivePercentage',
                        xAxisKey: 'date',
                    },
                    yAxisID: 'y1',
                    order: 1,
                },
            ],
        };
    }, [creationArchiveData, theme]);

    const aggregateOrProjectData = isAggregate
        ? aggregateHealthData
        : creationArchiveData;
    const notEnoughData = useMemo(
        () =>
            !isLoading &&
            !creationArchiveData.datasets.some((d) => d.data.length > 1),
        [creationArchiveData, isLoading],
    );
    const data =
        notEnoughData || isLoading ? placeholderData : aggregateOrProjectData;

    return (
        <>
            <Chart
                key={isAggregate ? 'aggregate' : 'project'}
                type='bar'
                data={data as any}
                options={{
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom' as const,
                            labels: {
                                filter: (legendItem) => {
                                    // Hide individual created flag type labels
                                    return !legendItem.text?.startsWith(
                                        'Created:',
                                    );
                                },
                                generateLabels: (chart) => {
                                    const original =
                                        ChartJS.defaults.plugins.legend.labels.generateLabels(
                                            chart,
                                        );
                                    const filtered = original.filter(
                                        (item) =>
                                            !item.text?.startsWith('Created:'),
                                    );

                                    // Add custom "Created Flags" legend item
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
                    interaction: {
                        intersect: false,
                        axis: 'xy',
                        mode: 'nearest',
                    },
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'week',
                                tooltipFormat: 'PPP',
                            },
                            stacked: true,
                        },
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            beginAtZero: true,
                            stacked: true,
                            title: {
                                display: true,
                                text: 'Number of Flags',
                            },
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Archive Percentage (%)',
                            },
                            grid: {
                                drawOnChartArea: false,
                            },
                        },
                    },
                }}
                height={100}
                width={250}
            />
            {tooltip?.dataPoints?.some((point) =>
                point.dataset.label?.startsWith('Created:'),
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
