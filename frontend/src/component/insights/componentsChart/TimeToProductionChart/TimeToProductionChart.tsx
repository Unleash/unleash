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
    console.log(data);
    const placeholderData = usePlaceholderData();
    return (
        <LineChart
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
