import 'chartjs-adapter-date-fns';
import { type FC, useMemo, useState } from 'react';
import type { InstanceInsightsSchema } from 'openapi';
import { useProjectChartData } from 'component/insights/hooks/useProjectChartData';
import { useTheme } from '@mui/material';
import type { GroupedDataByProject } from 'component/insights/hooks/useGroupedProjectTrends';
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
    type TooltipItem,
} from 'chart.js';
import { useLocationSettings } from 'hooks/useLocationSettings';
import type { TooltipState } from 'component/insights/components/LineChart/ChartTooltip/ChartTooltip';
import type { WeekData, RawWeekData, BatchedWeekData } from './types.ts';
import { createTooltip } from 'component/insights/components/LineChart/createTooltip.ts';
import { CreationArchiveRatioTooltip } from './CreationArchiveRatioTooltip.tsx';
import { getDateFnsLocale } from '../../getDateFnsLocale.ts';
import { customHighlightPlugin } from 'component/common/Chart/customHighlightPlugin.ts';
import { NotEnoughData } from 'component/insights/components/LineChart/LineChart.tsx';
import { placeholderData } from './placeholderData.ts';
import { Bar } from 'react-chartjs-2';
import { GraphCover } from 'component/insights/GraphCover.tsx';
import { format, startOfWeek } from 'date-fns';
import { batchWeekData } from './batchWeekData.ts';

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

type DataResult = 'Not Enough Data' | 'Batched' | 'Weekly';

export const CreationArchiveChart: FC<ICreationArchiveChartProps> = ({
    creationArchiveTrends,
    isLoading,
}) => {
    const creationVsArchivedChart = useProjectChartData(creationArchiveTrends);
    const theme = useTheme();
    const { locationSettings } = useLocationSettings();
    const [tooltip, setTooltip] = useState<null | TooltipState>(null);

    const { dataResult, aggregateOrProjectData } = useMemo(() => {
        const labels: string[] = Array.from(
            new Set(
                creationVsArchivedChart.datasets.flatMap((d) =>
                    d.data.map((item) => item.week),
                ),
            ),
        );

        const aggregateWeekData = (acc: WeekData, item?: RawWeekData) => {
            if (!item) return acc;

            acc.archivedFlags += item.archivedFlags || 0;

            if (item.createdFlags) {
                Object.entries(item.createdFlags).forEach(([_, count]) => {
                    acc.totalCreatedFlags += count;
                });
            }

            if (!acc.date) {
                acc.date = item.date;
            }

            return acc;
        };

        const createInitialWeekData = (label: string): WeekData => ({
            archivedFlags: 0,
            totalCreatedFlags: 0,
            archivePercentage: 0,
            week: label,
            date: '',
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

        let dataResult: DataResult = 'Weekly';
        let displayData: WeekData[] | BatchedWeekData[] = weeks;

        if (weeks.length < 2) {
            dataResult = 'Not Enough Data';
        } else if (weeks.length >= 12) {
            dataResult = 'Batched';
            displayData = batchWeekData(weeks);
        }

        return {
            dataResult,
            aggregateOrProjectData: {
                datasets: [
                    {
                        label: 'Flags archived',
                        data: displayData,
                        backgroundColor: theme.palette.charts.A2,
                        borderColor: theme.palette.charts.A2,
                        hoverBackgroundColor: theme.palette.charts.A2,
                        hoverBorderColor: theme.palette.charts.A2,
                        parsing: {
                            yAxisKey: 'archivedFlags',
                            xAxisKey: 'date',
                        },
                        order: 1,
                    },
                    {
                        label: 'Flags created',
                        data: displayData,
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
            },
        };
    }, [creationVsArchivedChart, theme]);

    const useGraphCover = dataResult === 'Not Enough Data' || isLoading;
    const showNotEnoughDataText =
        dataResult === 'Not Enough Data' && !isLoading;
    const data = useGraphCover ? placeholderData : aggregateOrProjectData;

    const locale = getDateFnsLocale(locationSettings.locale);
    const batchedTooltipTitle = (datapoints: TooltipItem<any>[]) => {
        const rawData = datapoints[0].raw as BatchedWeekData;
        const startDate = format(
            startOfWeek(new Date(rawData.date), {
                locale,
                weekStartsOn: 1,
            }),
            `PP`,
            { locale },
        );
        const endDate = format(new Date(rawData.endDate), `PP`, { locale });
        return `${startDate} – ${endDate}`;
    };

    const options = useMemo(
        () => ({
            responsive: true,
            ...(useGraphCover
                ? {
                      animation: {
                          duration: 0,
                      },
                  }
                : {}),
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
                    display: !useGraphCover,
                },
                tooltip: {
                    enabled: false,
                    position: 'average' as const,
                    external: createTooltip(setTooltip),
                    callbacks: {
                        title:
                            dataResult === 'Batched'
                                ? batchedTooltipTitle
                                : undefined,
                    },
                },
            },
            locale: locationSettings.locale,
            scales: {
                x: {
                    adapters: {
                        date: {
                            locale,
                        },
                    },
                    type: 'time' as const,
                    display: true,
                    time: {
                        unit:
                            dataResult === 'Batched'
                                ? ('month' as const)
                                : ('week' as const),
                        tooltipFormat: 'P',
                    },
                    grid: {
                        display: false,
                    },
                    ticks: {
                        source:
                            dataResult === 'Batched'
                                ? ('auto' as const)
                                : ('data' as const),
                        display: !useGraphCover,
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
                    ticks: {
                        stepSize: 1,
                        display: !useGraphCover,
                    },
                },
            },
        }),
        [theme, locationSettings, setTooltip, useGraphCover],
    );

    return (
        <>
            <Bar
                data={data}
                options={options}
                height={100}
                width={250}
                plugins={[
                    customHighlightPlugin({
                        maxHighlightOpacity: 0.24,
                    }),
                ]}
            />
            <CreationArchiveRatioTooltip tooltip={tooltip} />
            {useGraphCover ? (
                <GraphCover>
                    {showNotEnoughDataText ? <NotEnoughData /> : isLoading}
                </GraphCover>
            ) : null}
        </>
    );
};
