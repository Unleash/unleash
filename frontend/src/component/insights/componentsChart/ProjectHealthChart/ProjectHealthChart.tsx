import 'chartjs-adapter-date-fns';
import { type FC, useMemo } from 'react';
import type { InstanceInsightsSchema } from 'openapi';
import { HealthTooltip } from './HealthChartTooltip/HealthChartTooltip.tsx';
import {
    calculateTechDebt,
    useProjectChartData,
} from 'component/insights/hooks/useProjectChartData';
import {
    fillGradientPrimary,
    LineChart,
    NotEnoughData,
} from 'component/insights/components/LineChart/LineChart';
import { useTheme } from '@mui/material';
import type { GroupedDataByProject } from 'component/insights/hooks/useGroupedProjectTrends';
import { usePlaceholderData } from 'component/insights/hooks/usePlaceholderData';

interface IProjectHealthChartProps {
    projectFlagTrends: GroupedDataByProject<
        InstanceInsightsSchema['projectFlagTrends']
    >;
    isAggregate?: boolean;
    isLoading?: boolean;
}

type WeekData = {
    total: number;
    stale: number;
    potentiallyStale: number;
    week: string;
    date?: string;
};

const calculateHealth = (item: WeekData) =>
    (
        ((item.total - item.stale - item.potentiallyStale) / item.total) *
        100
    ).toFixed(2);

export const ProjectHealthChart: FC<IProjectHealthChartProps> = ({
    projectFlagTrends,
    isAggregate,
    isLoading,
}) => {
    const projectsData = useProjectChartData(projectFlagTrends);
    const theme = useTheme();
    const placeholderData = usePlaceholderData();

    const aggregateHealthData = useMemo(() => {
        const labels = Array.from(
            new Set(
                projectsData.datasets.flatMap((d) =>
                    d.data.map((item) => item.week),
                ),
            ),
        );

        const weeks = labels
            .map((label) => {
                return projectsData.datasets
                    .map((d) => d.data.find((item) => item.week === label))
                    .reduce(
                        (acc, item) => {
                            if (item) {
                                acc.total += item.total;
                                acc.stale += item.stale;
                                acc.potentiallyStale += item.potentiallyStale;
                            }
                            if (!acc.date) {
                                acc.date = item?.date;
                            }
                            return acc;
                        },
                        {
                            total: 0,
                            stale: 0,
                            potentiallyStale: 0,
                            week: label,
                        } as WeekData,
                    );
            })
            .sort((a, b) => (a.week > b.week ? 1 : -1));
        return {
            datasets: [
                {
                    label: 'Technical debt',
                    data: weeks.map((item) => ({
                        health: item.total ? calculateHealth(item) : undefined,
                        technicalDebt: item.total
                            ? calculateTechDebt(item)
                            : undefined,
                        date: item.date,
                        total: item.total,
                        stale: item.stale,
                        potentiallyStale: item.potentiallyStale,
                    })),
                    borderColor: theme.palette.primary.light,
                    backgroundColor: fillGradientPrimary,
                    fill: true,
                    order: 3,
                },
            ],
        };
    }, [projectsData, theme]);

    const aggregateOrProjectData = isAggregate
        ? aggregateHealthData
        : projectsData;
    const notEnoughData = useMemo(
        () =>
            !isLoading && !projectsData.datasets.some((d) => d.data.length > 1),
        [projectsData, isLoading],
    );
    const data =
        notEnoughData || isLoading ? placeholderData : aggregateOrProjectData;

    return (
        <LineChart
            key={isAggregate ? 'aggregate' : 'project'}
            data={data}
            TooltipComponent={HealthTooltip}
            overrideOptions={
                notEnoughData
                    ? {}
                    : {
                          parsing: {
                              yAxisKey: 'technicalDebt',
                              xAxisKey: 'date',
                          },
                          plugins: {
                              legend: {
                                  display: !isAggregate,
                              },
                          },
                          scales: {
                              y: {
                                  min: 0,
                                  max: 100,
                                  beginAtZero: true,
                                  type: 'linear',
                                  grid: {
                                      color: theme.palette.divider,
                                      borderColor: theme.palette.divider,
                                  },
                                  ticks: {
                                      color: theme.palette.text.secondary,
                                      display: true,
                                      precision: 0,
                                  },
                              },
                              x: {
                                  type: 'time',
                                  time: {
                                      unit: 'week',
                                      tooltipFormat: 'PPP',
                                  },
                                  grid: {
                                      color: 'transparent',
                                      borderColor: 'transparent',
                                  },
                                  ticks: {
                                      color: theme.palette.text.secondary,
                                      display: true,
                                      source: 'data',
                                      maxRotation: 90,
                                      minRotation: 23.5,
                                  },
                              },
                          },
                      }
            }
            cover={notEnoughData ? <NotEnoughData /> : isLoading}
        />
    );
};
