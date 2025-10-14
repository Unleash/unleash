import 'chartjs-adapter-date-fns';
import { type FC, useMemo } from 'react';
import type { InstanceInsightsSchema } from 'openapi';
import { useProjectChartData } from 'component/insights/hooks/useProjectChartData';
import {
    fillGradientPrimary,
    LineChart,
    NotEnoughData,
} from 'component/insights/components/LineChart/LineChart';
import { useTheme } from '@mui/material';
import type { GroupedDataByProject } from 'component/insights/hooks/useGroupedProjectTrends';
import { usePlaceholderData } from 'component/insights/hooks/usePlaceholderData';
import type { BatchedWeekData, WeekData } from './types.ts';
import { batchProductionFlagsData } from './batchProductionFlagsData.ts';
import { useBatchedTooltipDate } from '../useBatchedTooltipDate.ts';

interface IProjectHealthChartProps {
    lifecycleTrends: GroupedDataByProject<
        InstanceInsightsSchema['lifecycleTrends']
    >;
    isAggregate?: boolean;
    isLoading?: boolean;
    labels: { week: string; date: string }[];
}

const useOverrideOptions = (chartDataResult: ChartDataResult) => {
    const batchedTooltipTitle = useBatchedTooltipDate();
    const sharedOptions = {
        parsing: {
            yAxisKey: 'newProductionFlags',
            xAxisKey: 'date',
        },
    };
    switch (chartDataResult) {
        case 'Batched': {
            return {
                ...sharedOptions,
                scales: {
                    x: {
                        time: {
                            unit: 'month' as const,
                            tooltipFormat: 'P',
                        },
                        ticks: {
                            source: 'auto' as const,
                        },
                    },
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            title: batchedTooltipTitle,
                        },
                    },
                },
            };
        }
        case 'Weekly':
            return sharedOptions;
        case 'Not Enough Data':
            return {};
    }
};

export const NewProductionFlagsChart: FC<IProjectHealthChartProps> = ({
    labels,
    lifecycleTrends,
    isAggregate,
    isLoading,
}) => {
    const lifecycleData = useProjectChartData(lifecycleTrends);
    const theme = useTheme();
    const placeholderData = usePlaceholderData();

    const shouldBatchData = labels.length >= 12;

    const { aggregateProductionFlagsData, chartDataResult } = useMemo(() => {
        const weeks: WeekData[] = labels.map(({ week, date }) => {
            return lifecycleData.datasets
                .map((d) => d.data.find((item) => item.week === week))
                .reduce(
                    (acc: WeekData, item: WeekData) => {
                        if (item) {
                            acc.newProductionFlags =
                                (acc.newProductionFlags ?? 0) +
                                (item.newProductionFlags ?? 0);
                        }
                        return acc;
                    },
                    { date, week },
                );
        });

        let chartDataResult: ChartDataResult = 'Weekly';
        let displayData: WeekData[] | (BatchedWeekData | null)[] = weeks;

        if (!isLoading && labels.length < 2) {
            chartDataResult = 'Not Enough Data';
        } else if (shouldBatchData) {
            chartDataResult = 'Batched';
            displayData = batchProductionFlagsData(weeks);
        }

        return {
            chartDataResult,
            aggregateProductionFlagsData: {
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
    }, [lifecycleData, theme, isLoading]);

    const padProjectData = () => {
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
            return shouldBatchData ? batchProductionFlagsData(padded) : padded;
        };

        return lifecycleData.datasets.map(({ data, ...dataset }) => ({
            ...dataset,
            data: padData(data),
        }));
    };

    const aggregateOrProjectData = isAggregate
        ? aggregateProductionFlagsData
        : {
              datasets: padProjectData(),
          };

    const notEnoughData = chartDataResult === 'Not Enough Data';
    const data =
        notEnoughData || isLoading ? placeholderData : aggregateOrProjectData;

    const overrideOptions = useOverrideOptions(chartDataResult);

    return (
        <LineChart
            key={isAggregate ? 'aggregate' : 'project'}
            data={data}
            overrideOptions={overrideOptions}
            cover={notEnoughData ? <NotEnoughData /> : isLoading}
        />
    );
};
