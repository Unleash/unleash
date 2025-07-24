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
    createdFlags: Record<string, number>;
    week: string;
    date?: string;
};

export const CreationArchiveChart: FC<ICreationArchiveChartProps> = ({
    creationArchiveTrends,
    isAggregate,
    isLoading,
}) => {
    const creationArchiveData = useProjectChartData(creationArchiveTrends);
    const theme = useTheme();
    const placeholderData = usePlaceholderData();

    const aggregateHealthData = useMemo(() => {
        const labels: string[] = Array.from(
            new Set(
                creationArchiveData.datasets.flatMap((d) =>
                    d.data.map((item) => item.week),
                ),
            ),
        );

        const weeks: WeekData[] = labels
            .map((label) => {
                return creationArchiveData.datasets
                    .map((d) => d.data.find((item) => item.week === label))
                    .reduce(
                        (acc: WeekData, item: WeekData) => {
                            if (item) {
                                acc.archivedFlags += item.archivedFlags || 0;
                                const createdFlagsSum = item.createdFlags
                                    ? Object.values(item.createdFlags).reduce(
                                          (sum: number, count: number) =>
                                              sum + count,
                                          0,
                                      )
                                    : 0;
                                acc.totalCreatedFlags += createdFlagsSum;
                            }
                            if (!acc.date) {
                                acc.date = item?.date;
                            }
                            return acc;
                        },
                        {
                            archivedFlags: 0,
                            totalCreatedFlags: 0,
                            week: label,
                        } as WeekData,
                    );
            })
            .sort((a, b) => (a.week > b.week ? 1 : -1));
        return {
            datasets: [
                {
                    label: 'Number of created flags',
                    data: weeks,
                    borderColor: theme.palette.primary.light,
                    backgroundColor: fillGradientPrimary,
                    fill: true,
                    order: 3,
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
        <LineChart
            key={isAggregate ? 'aggregate' : 'project'}
            data={data}
            overrideOptions={
                notEnoughData
                    ? {}
                    : {
                          parsing: {
                              yAxisKey: 'totalCreatedFlags',
                              xAxisKey: 'date',
                          },
                      }
            }
            cover={notEnoughData ? <NotEnoughData /> : isLoading}
        />
    );
};
