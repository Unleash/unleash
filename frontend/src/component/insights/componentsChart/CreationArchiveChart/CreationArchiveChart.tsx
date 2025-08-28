import 'chartjs-adapter-date-fns';
import { type FC, useMemo } from 'react';
import type { InstanceInsightsSchema } from 'openapi';
import { useProjectChartData } from 'component/insights/hooks/useProjectChartData';
import { useTheme } from '@mui/material';
import type { GroupedDataByProject } from 'component/insights/hooks/useGroupedProjectTrends';
import { usePlaceholderData } from 'component/insights/hooks/usePlaceholderData';
import type { ChartData } from 'chart.js';
import type { WeekData, RawWeekData } from './types.ts';
import { CreationArchiveRatioTooltip } from './CreationArchiveRatioTooltip.tsx';
import { BarChart } from 'component/insights/components/LineChart/BarChart.tsx';

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
    const placeholderData = usePlaceholderData() as ChartData<'bar', unknown>;

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
                    parsing: { yAxisKey: 'archivedFlags', xAxisKey: 'date' },
                    order: 1,
                },
                {
                    label: 'Flags created',
                    data: weeks,
                    backgroundColor: theme.palette.charts.A1,
                    borderColor: theme.palette.charts.A1,
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

    return (
        <BarChart TooltipComponent={CreationArchiveRatioTooltip} data={data} />
    );
};
