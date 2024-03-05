import 'chartjs-adapter-date-fns';
import { useMemo, type VFC } from 'react';
import { type ExecutiveSummarySchema } from 'openapi';
import { HealthTooltip } from './HealthChartTooltip/HealthChartTooltip';
import { useProjectChartData } from 'component/executiveDashboard/hooks/useProjectChartData';
import {
    LineChart,
    NotEnoughData,
} from 'component/executiveDashboard/components/LineChart/LineChart';
import { useTheme } from '@mui/material';

interface IFlagsProjectChartProps {
    projectFlagTrends: ExecutiveSummarySchema['projectFlagTrends'];
    isAggregate?: boolean;
}

export const ProjectHealthChart: VFC<IFlagsProjectChartProps> = ({
    projectFlagTrends,
    isAggregate,
}) => {
    const projectsData = useProjectChartData(projectFlagTrends);
    const theme = useTheme();

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
                                acc.stale += item.stale + item.potentiallyStale;
                            }
                            if (!acc.date) {
                                acc.date = item?.date;
                            }
                            return acc;
                        },
                        {
                            total: 0,
                            stale: 0,
                            week: label,
                        } as {
                            total: number;
                            stale: number;
                            week: string;
                            date?: string;
                        },
                    );
            })
            .sort((a, b) => (a.week > b.week ? 1 : -1));

        return {
            datasets: [
                {
                    label: 'Health',
                    data: weeks.map((item) => ({
                        health: item.total
                            ? ((item.total - item.stale) / item.total) * 100
                            : undefined,
                        date: item.date,
                    })),
                    borderColor: theme.palette.primary.light,
                    fill: false,
                    order: 3,
                },
            ],
        };
    }, [projectsData, theme]);

    const data = isAggregate ? aggregateHealthData : projectsData;
    const notEnoughData = useMemo(
        () =>
            projectsData.datasets.some((d) => d.data.length > 1) ? false : true,
        [projectsData],
    );

    return (
        <LineChart
            key={isAggregate ? 'aggregate' : 'project'}
            data={data}
            isLocalTooltip
            TooltipComponent={isAggregate ? undefined : HealthTooltip}
            overrideOptions={
                notEnoughData
                    ? {}
                    : {
                          parsing: { yAxisKey: 'health', xAxisKey: 'date' },
                      }
            }
            cover={notEnoughData ? <NotEnoughData /> : false}
        />
    );
};
