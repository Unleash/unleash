import { useTheme } from '@mui/material';
import type { GroupedDataByProject } from 'component/insights/hooks/useGroupedProjectTrends';
import { usePlaceholderData } from 'component/insights/hooks/usePlaceholderData';
import { useProjectChartData } from 'component/insights/hooks/useProjectChartData';
import type { InstanceInsightsSchema } from 'openapi';
import type { BatchedWeekData, WeekData } from './types.ts';
import { useMemo } from 'react';
import { batchProductionFlagsData } from './batchProductionFlagsData.ts';
import { fillGradientPrimary } from 'component/insights/components/LineChart/LineChart';
import type { ChartData } from 'chart.js';
import { calculateMedian } from 'component/insights/componentsStat/NewProductionFlagsStats/calculateMedian.ts';
import type { ChartDataState } from '../chartDataState.ts';

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
    type: ChartDataState;
    data: ChartData<'line', WeekData[] | number[]>;
    median: string | number;
};

const padProjectData = ({
    labels,
    lifecycleData,
    shouldBatchData,
}: {
    labels: UseProductionFlagsDataProps['labels'];
    lifecycleData: ChartData<'line', WeekData[]>;
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

type MemoResult =
    | {
          data: ChartData<'line', number[]>;
          chartDataResult: Extract<
              ChartDataState,
              { status: 'Loading' | 'Not Enough Data' }
          >;
      }
    | {
          data: ChartData<'line', WeekData[]>;
          chartDataResult: Extract<
              ChartDataState,
              { status: 'Weekly' | 'Batched' }
          >;
      };

function hasWeekData(
    result: MemoResult,
): result is Extract<MemoResult, { data: ChartData<'line', WeekData[]> }> {
    return (
        result.chartDataResult.status === 'Weekly' ||
        result.chartDataResult.status === 'Batched'
    );
}

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

    const memoResult = useMemo((): MemoResult => {
        if (loading) {
            return {
                chartDataResult: { status: 'Loading' as const },
                data: placeholderData,
            };
        }

        if (labels.length < 2) {
            return {
                chartDataResult: { status: 'Not Enough Data' as const },
                data: placeholderData,
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

        let chartDataResult: ChartDataState = { status: 'Weekly' };
        let displayData: WeekData[] | BatchedWeekData[] = weeks;

        if (shouldBatchData) {
            chartDataResult = { status: 'Batched', batchSize };
            displayData = batchProductionFlagsData(weeks, batchSize);
        }

        return {
            chartDataResult,
            data: {
                datasets: [
                    {
                        label: 'Number of new flags',
                        data: displayData,
                        borderColor: theme.palette.primary.light,
                        backgroundColor: fillGradientPrimary,
                        fill: true,
                        order: 3,
                    },
                ],
            },
        };
    }, [lifecycleData, theme, loading]);

    if (!hasWeekData(memoResult)) {
        return {
            type: memoResult.chartDataResult,
            data: memoResult.data,
            median: 'N/A',
        };
    }

    const { data, chartDataResult } = memoResult;

    const aggregateOrProjectData = showAllProjects
        ? data
        : {
              datasets: padProjectData({
                  labels,
                  lifecycleData,
                  shouldBatchData,
              }),
          };

    const median = calculateMedian(data.datasets);

    return {
        type: chartDataResult,
        data: aggregateOrProjectData,
        median,
    };
};
