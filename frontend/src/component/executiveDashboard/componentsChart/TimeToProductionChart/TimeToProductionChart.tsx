import { useMemo, type VFC } from 'react';
import 'chartjs-adapter-date-fns';
import type { ExecutiveSummarySchema } from 'openapi';
import {
    fillGradientPrimary,
    LineChart,
    NotEnoughData,
} from '../../components/LineChart/LineChart';
import { useProjectChartData } from '../../hooks/useProjectChartData';
import type { GroupedDataByProject } from '../../hooks/useGroupedProjectTrends';
import { usePlaceholderData } from '../../hooks/usePlaceholderData';
import { TimeToProductionTooltip } from './TimeToProductionTooltip/TimeToProductionTooltip';
import { useTheme } from '@mui/material';

interface ITimeToProductionChartProps {
    projectFlagTrends: GroupedDataByProject<
        ExecutiveSummarySchema['projectFlagTrends']
    >;
    isAggregate?: boolean;
}

type GroupedDataByDate<T> = Record<string, T[]>;

type DateResult<T> = Record<string, T>;

function averageTimeToProduction(
    projectsData: ExecutiveSummarySchema['projectFlagTrends'],
): DateResult<number> {
    // Group the data by date
    const groupedData: GroupedDataByDate<number> = {};
    projectsData.forEach((item) => {
        const { date, timeToProduction } = item;
        if (!groupedData[date]) {
            groupedData[date] = [];
        }
        if (timeToProduction !== undefined) {
            groupedData[date].push(timeToProduction);
        }
    });
    // Calculate the average time to production for each date
    const averageByDate: DateResult<number> = {};
    Object.entries(groupedData).forEach(([date, times]) => {
        const sum = times.reduce((acc, curr) => acc + curr, 0);
        const average = sum / times.length;
        averageByDate[date] = average;
    });
    return averageByDate;
}

export const TimeToProductionChart: VFC<ITimeToProductionChartProps> = ({
    projectFlagTrends,
    isAggregate,
}) => {
    const theme = useTheme();
    const projectsDatasets = useProjectChartData(projectFlagTrends);
    const notEnoughData = useMemo(
        () => !projectsDatasets.datasets.some((d) => d.data.length > 1),
        [projectsDatasets],
    );

    const aggregatedPerDay = useMemo(() => {
        const result = averageTimeToProduction(
            Object.values(projectsDatasets.datasets).flatMap(
                (item) => item.data,
            ),
        );
        const data = Object.entries(result)
            .map(([date, timeToProduction]) => ({ date, timeToProduction }))
            .sort(
                (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime(),
            );

        return {
            datasets: [
                {
                    label: 'Time to production',
                    data,
                    borderColor: theme.palette.primary.light,
                    backgroundColor: fillGradientPrimary,
                    fill: true,
                    order: 3,
                },
            ],
        };
    }, [JSON.stringify(projectsDatasets), theme]);

    const data = isAggregate ? aggregatedPerDay : projectsDatasets;
    const placeholderData = usePlaceholderData();
    return (
        <LineChart
            key={isAggregate ? 'aggregate-ttp' : 'ttp'}
            data={notEnoughData ? placeholderData : data}
            isLocalTooltip
            TooltipComponent={TimeToProductionTooltip}
            overrideOptions={
                notEnoughData
                    ? {}
                    : {
                          parsing: {
                              yAxisKey: 'timeToProduction',
                              xAxisKey: 'date',
                          },
                      }
            }
            cover={notEnoughData ? <NotEnoughData /> : false}
        />
    );
};
