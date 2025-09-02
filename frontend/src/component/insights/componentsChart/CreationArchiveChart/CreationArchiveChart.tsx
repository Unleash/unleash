import 'chartjs-adapter-date-fns';
import { type FC, useMemo, useState } from 'react';
import type { InstanceInsightsSchema } from 'openapi';
import { useProjectChartData } from 'component/insights/hooks/useProjectChartData';
import { styled, useTheme } from '@mui/material';
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
} from 'chart.js';
import { useLocationSettings } from 'hooks/useLocationSettings';
import type { TooltipState } from 'component/insights/components/LineChart/ChartTooltip/ChartTooltip';
import type { WeekData, RawWeekData } from './types.ts';
import { createTooltip } from 'component/insights/components/LineChart/createTooltip.ts';
import { CreationArchiveRatioTooltip } from './CreationArchiveRatioTooltip.tsx';
import { Chart } from 'react-chartjs-2';
import { getDateFnsLocale } from '../../getDateFnsLocale.ts';
import { customHighlightPlugin } from 'component/common/Chart/customHighlightPlugin.ts';
import { NotEnoughData } from 'component/insights/components/LineChart/LineChart.tsx';
import { usePlaceholderData } from 'component/insights/hooks/usePlaceholderData.ts';

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

export const CreationArchiveChart: FC<ICreationArchiveChartProps> = ({
    creationArchiveTrends,
    isLoading,
}) => {
    const creationVsArchivedChart = useProjectChartData(creationArchiveTrends);
    const theme = useTheme();
    const placeholderData = usePlaceholderData();
    const { locationSettings } = useLocationSettings();
    const [tooltip, setTooltip] = useState<null | TooltipState>(null);

    const { notEnoughData, aggregateOrProjectData } = useMemo(() => {
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
            notEnoughData: weeks.length < 2,
            aggregateOrProjectData: {
                datasets: [
                    {
                        label: 'Flags archived',
                        data: weeks,
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
            },
        };
    }, [creationVsArchivedChart, theme]);

    const useGraphCover = notEnoughData || isLoading;
    const data = useGraphCover ? placeholderData : aggregateOrProjectData;

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
                    ticks: {
                        source: 'data',
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
                plugins={[
                    customHighlightPlugin({
                        maxHighlightOpacity: 0.24,
                    }),
                ]}
            />
            <CreationArchiveRatioTooltip tooltip={tooltip} />
            {useGraphCover ? (
                <StyledCover>
                    <StyledCoverContent>
                        {notEnoughData ? <NotEnoughData /> : isLoading}
                    </StyledCoverContent>
                </StyledCover>
            ) : null}
        </>
    );
};
