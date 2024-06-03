import { useMemo, type VFC } from 'react';
import 'chartjs-adapter-date-fns';
import type { InstanceInsightsSchema } from 'openapi';
import {
    fillGradientPrimary,
    LineChart,
    NotEnoughData,
} from 'component/insights/components/LineChart/LineChart';
import { useProjectChartData } from 'component/insights/hooks/useProjectChartData';
import type { GroupedDataByProject } from 'component/insights/hooks/useGroupedProjectTrends';
import { usePlaceholderData } from 'component/insights/hooks/usePlaceholderData';
import { TimeToProductionTooltip } from './TimeToProductionTooltip/TimeToProductionTooltip';
import { useTheme } from '@mui/material';
import { medianTimeToProduction } from './median-time-to-production';

interface ITimeToProductionChartProps {
    projectFlagTrends: GroupedDataByProject<
        InstanceInsightsSchema['projectFlagTrends']
    >;
    isAggregate?: boolean;
    isLoading?: boolean;
}

export const TimeToProductionChart: VFC<ITimeToProductionChartProps> = ({
    projectFlagTrends,
    isAggregate,
    isLoading,
}) => {
    const theme = useTheme();
    const projectsDatasets = useProjectChartData(projectFlagTrends);
    const notEnoughData = useMemo(
        () =>
            !isLoading &&
            !projectsDatasets.datasets.some((d) => d.data.length > 1),
        [projectsDatasets, isLoading],
    );

    const aggregatedPerDay = useMemo(() => {
        const result = medianTimeToProduction(
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
                    label: 'Median time to production',
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
            data={notEnoughData || isLoading ? placeholderData : data}
            TooltipComponent={TimeToProductionTooltip}
            overrideOptions={
                notEnoughData
                    ? {}
                    : {
                          parsing: {
                              yAxisKey: 'timeToProduction',
                              xAxisKey: 'date',
                          },
                          scales: {
                              y: {
                                  min: 0,
                                  max: 100,
                              },
                          },
                      }
            }
            cover={notEnoughData ? <NotEnoughData /> : isLoading}
        />
    );
};
