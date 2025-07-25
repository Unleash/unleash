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

interface IProjectHealthChartProps {
    lifecycleTrends: GroupedDataByProject<
        InstanceInsightsSchema['lifecycleTrends']
    >;
    isAggregate?: boolean;
    isLoading?: boolean;
}

type WeekData = {
    newProductionFlags: number;
    week: string;
    date?: string;
};

export const NewProductionFlagsChart: FC<IProjectHealthChartProps> = ({
    lifecycleTrends,
    isAggregate,
    isLoading,
}) => {
    const lifecycleData = useProjectChartData(lifecycleTrends);
    const theme = useTheme();
    const placeholderData = usePlaceholderData();

    const aggregateHealthData = useMemo(() => {
        const labels: string[] = Array.from(
            new Set(
                lifecycleData.datasets.flatMap((d) =>
                    d.data.map((item) => item.week),
                ),
            ),
        );

        const weeks: WeekData[] = labels
            .map((label) => {
                return lifecycleData.datasets
                    .map((d) => d.data.find((item) => item.week === label))
                    .reduce(
                        (acc: WeekData, item: WeekData) => {
                            if (item) {
                                acc.newProductionFlags +=
                                    item.newProductionFlags;
                            }
                            if (!acc.date) {
                                acc.date = item?.date;
                            }
                            return acc;
                        },
                        {
                            newProductionFlags: 0,
                            week: label,
                        } as WeekData,
                    );
            })
            .sort((a, b) => (a.week > b.week ? 1 : -1));
        return {
            datasets: [
                {
                    label: 'Number of new flags',
                    data: weeks,
                    borderColor: theme.palette.primary.light,
                    backgroundColor: fillGradientPrimary,
                    fill: true,
                    order: 3,
                },
            ],
        };
    }, [lifecycleData, theme]);

    const aggregateOrProjectData = isAggregate
        ? aggregateHealthData
        : lifecycleData;
    const notEnoughData = useMemo(
        () =>
            !isLoading &&
            !lifecycleData.datasets.some((d) => d.data.length > 1),
        [lifecycleData, isLoading],
    );
    const data =
        notEnoughData || isLoading ? placeholderData : aggregateOrProjectData;

    return (
        <LineChart
            key={isAggregate ? 'aggregate' : 'project'}
            data={data}
            overrideOptions={
                notEnoughData
                    ? {}
                    : {
                          parsing: {
                              yAxisKey: 'newProductionFlags',
                              xAxisKey: 'date',
                          },
                      }
            }
            cover={notEnoughData ? <NotEnoughData /> : isLoading}
        />
    );
};
