import { useTheme } from '@mui/material';
import type { GroupedDataByProject } from 'component/insights/hooks/useGroupedProjectTrends';
import { usePlaceholderData } from 'component/insights/hooks/usePlaceholderData';
import { useProjectChartData } from 'component/insights/hooks/useProjectChartData';
import type { InstanceInsightsSchema } from 'openapi';
import type { BatchedWeekData, WeekData } from './types.ts';
import { useMemo } from 'react';
import { batchProductionFlagsData } from './batchProductionFlagsData.ts';
import { fillGradientPrimary } from 'component/insights/components/LineChart/LineChart';
import { calculateMedian } from 'component/insights/componentsStat/NewProductionFlagsStats/calculateMedian.ts';
import { hasRealData, type ChartData } from '../chartData.ts';
import type { ChartData as ChartJsData } from 'chart.js';

const batchSize = 4;

type UseProductionFlagsDataProps = {
    groupedLifecycleData: GroupedDataByProject<
        InstanceInsightsSchema['lifecycleTrends']
    >;
    showAllProjects?: boolean;
    loading?: boolean;
    labels: { week: string; date: string }[];
};

type UseProductionFlagsDataResult = {
    chartData: ChartData<WeekData, number>;
    median: string | number;
};

const padProjectData = ({
    labels,
    lifecycleData,
    shouldBatchData,
}: {
    labels: UseProductionFlagsDataProps['labels'];
    lifecycleData: ChartJsData<'line', WeekData[]>;
    shouldBatchData: boolean;
}) => {
    if (lifecycleData.datasets.length === 0) {
        // fallback for when there's no data in the selected time period for the selected projects
        return [
            {
                label: 'No data',
                data: labels,
            },
        ];
    }

    const padData = (data: WeekData[]) => {
        const padded = labels.map(
            ({ date, week }) =>
                data.find((item) => item?.week === week) ?? {
                    date,
                    week,
                },
        );
        return shouldBatchData
            ? batchProductionFlagsData(padded, batchSize)
            : padded;
    };

    return lifecycleData.datasets.map(({ data, ...dataset }) => ({
        ...dataset,
        data: padData(data),
    }));
};

export const useProductionFlagsData = ({
    groupedLifecycleData,
    showAllProjects,
    loading,
    labels,
}: UseProductionFlagsDataProps): UseProductionFlagsDataResult => {
    const lifecycleData = useProjectChartData(groupedLifecycleData);
    const theme = useTheme();
    const placeholderData = usePlaceholderData();

    const shouldBatchData = labels.length >= 12;

    const chartData = useMemo((): ChartData<
        WeekData | BatchedWeekData,
        number
    > => {
        if (loading) {
            return {
                state: 'Loading',
                value: placeholderData,
            };
        }

        if (labels.length < 2) {
            return {
                state: 'Not Enough Data',
                value: placeholderData,
            };
        }

        const weeks: WeekData[] = labels.map(({ week, date }) => {
            return lifecycleData.datasets
                .map((d) => d.data.find((item: WeekData) => item.week === week))
                .reduce(
                    (acc: WeekData, item: WeekData) => {
                        if (item && item.newProductionFlags !== undefined) {
                            acc.newProductionFlags =
                                (acc.newProductionFlags ?? 0) +
                                item.newProductionFlags;
                        }
                        return acc;
                    },
                    { date, week },
                );
        });

        const chartArgs = (data: WeekData[] | BatchedWeekData[]) => ({
            datasets: [
                {
                    label: 'Number of new flags',
                    data,
                    borderColor: theme.palette.primary.light,
                    backgroundColor: fillGradientPrimary,
                    fill: true,
                    order: 3,
                },
            ],
        });

        if (shouldBatchData) {
            return {
                state: 'Batched',
                value: chartArgs(batchProductionFlagsData(weeks, batchSize)),
                batchSize: batchSize,
            };
        }

        return {
            state: 'Weekly',
            value: chartArgs(weeks),
        };
    }, [lifecycleData, theme, loading]);

    if (!hasRealData(chartData)) {
        return {
            chartData,
            median: 'N/A',
        };
    }

    const { value: allProjectsData, ...metadata } = chartData;

    const value = showAllProjects
        ? allProjectsData
        : {
              datasets: padProjectData({
                  labels,
                  lifecycleData,
                  shouldBatchData,
              }),
          };

    const median = calculateMedian(value.datasets);

    return {
        chartData: {
            ...metadata,
            value,
        },
        median,
    };
};
