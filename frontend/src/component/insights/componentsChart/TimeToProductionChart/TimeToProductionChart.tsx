import { useMemo, type FC } from 'react';
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
import { TimeToProductionTooltip } from './TimeToProductionTooltip/TimeToProductionTooltip.tsx';
import { useTheme } from '@mui/material';
import { medianTimeToProduction } from './median-time-to-production.ts';

interface ITimeToProductionChartProps {
    projectFlagTrends: GroupedDataByProject<
        InstanceInsightsSchema['projectFlagTrends']
    >;
    isAggregate?: boolean;
    isLoading?: boolean;
}

export const TimeToProductionChart: FC<ITimeToProductionChartProps> = ({
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

    const filteredProjectsDatasets = useMemo(
        () => ({
            ...projectsDatasets,
            datasets: projectsDatasets.datasets.map((dataset) => ({
                ...dataset,
                data: dataset.data.filter((item) => item.timeToProduction),
            })),
        }),
        [projectsDatasets],
    );

    const aggregatedPerDay = useMemo(() => {
        const result = medianTimeToProduction(
            Object.values(filteredProjectsDatasets.datasets).flatMap(
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
    }, [JSON.stringify(filteredProjectsDatasets), theme]);

    const data = isAggregate ? aggregatedPerDay : filteredProjectsDatasets;
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
                      }
            }
            cover={notEnoughData ? <NotEnoughData /> : isLoading}
        />
    );
};
