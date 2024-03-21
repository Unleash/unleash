import { ConditionallyRender } from '../common/ConditionallyRender/ConditionallyRender';
import { Widget } from './components/Widget/Widget';
import { UserStats } from './componentsStat/UserStats/UserStats';
import { UsersChart } from './componentsChart/UsersChart/UsersChart';
import { UsersPerProjectChart } from './componentsChart/UsersPerProjectChart/UsersPerProjectChart';
import { FlagStats } from './componentsStat/FlagStats/FlagStats';
import { FlagsChart } from './componentsChart/FlagsChart/FlagsChart';
import { FlagsProjectChart } from './componentsChart/FlagsProjectChart/FlagsProjectChart';
import { HealthStats } from './componentsStat/HealthStats/HealthStats';
import { ProjectHealthChart } from './componentsChart/ProjectHealthChart/ProjectHealthChart';
import { TimeToProduction } from './componentsStat/TimeToProduction/TimeToProduction';
import { TimeToProductionChart } from './componentsChart/TimeToProductionChart/TimeToProductionChart';
import { MetricsSummaryChart } from './componentsChart/MetricsSummaryChart/MetricsSummaryChart';
import { UpdatesPerEnvironmentTypeChart } from './componentsChart/UpdatesPerEnvironmentTypeChart/UpdatesPerEnvironmentTypeChart';
import type { InstanceInsightsSchema } from 'openapi';
import type { GroupedDataByProject } from './hooks/useGroupedProjectTrends';
import { Box, styled } from '@mui/material';
import { allOption } from '../common/ProjectSelect/ProjectSelect';
import type { VFC } from 'react';
import { chartInfo } from './chart-info';

interface IChartsProps {
    flagTrends: InstanceInsightsSchema['flagTrends'];
    projectsData: InstanceInsightsSchema['projectFlagTrends'];
    groupedProjectsData: GroupedDataByProject<
        InstanceInsightsSchema['projectFlagTrends']
    >;
    metricsData: InstanceInsightsSchema['metricsSummaryTrends'];
    groupedMetricsData: GroupedDataByProject<
        InstanceInsightsSchema['metricsSummaryTrends']
    >;
    users: InstanceInsightsSchema['users'];
    userTrends: InstanceInsightsSchema['userTrends'];
    environmentTypeTrends: InstanceInsightsSchema['environmentTypeTrends'];
    summary: {
        total: number;
        active: number;
        stale: number;
        potentiallyStale: number;
        averageUsers: number;
        averageHealth?: string;
        flagsPerUser?: string;
    };
    medianTimeToProduction: number;
    loading: boolean;
    projects: string[];
}

const StyledGrid = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(2, 1fr)`,
    gridAutoRows: 'auto',
    gap: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    [theme.breakpoints.up('md')]: {
        gridTemplateColumns: `300px 1fr`,
    },
}));

const ChartWidget = styled(Widget)(({ theme }) => ({
    [theme.breakpoints.down('md')]: {
        gridColumnStart: 'span 2',
        order: 2,
    },
}));

export const InsightsCharts: VFC<IChartsProps> = ({
    projects,
    users,
    summary,
    userTrends,
    groupedProjectsData,
    flagTrends,
    medianTimeToProduction,
    groupedMetricsData,
    environmentTypeTrends,
    loading,
}) => {
    const showAllProjects = projects[0] === allOption.id;
    const isOneProjectSelected = projects.length === 1;

    return (
        <>
            <StyledGrid>
                <ConditionallyRender
                    condition={showAllProjects}
                    show={
                        <Widget {...chartInfo.totalUsers}>
                            <UserStats
                                count={users.total}
                                active={users.active}
                                inactive={users.inactive}
                            />
                        </Widget>
                    }
                    elseShow={
                        <Widget
                            {...(isOneProjectSelected
                                ? chartInfo.usersInProject
                                : chartInfo.avgUsersPerProject)}
                        >
                            <UserStats count={summary.averageUsers} />
                        </Widget>
                    }
                />
                <ConditionallyRender
                    condition={showAllProjects}
                    show={
                        <ChartWidget {...chartInfo.users}>
                            <UsersChart
                                userTrends={userTrends}
                                isLoading={loading}
                            />
                        </ChartWidget>
                    }
                    elseShow={
                        <ChartWidget {...chartInfo.usersPerProject}>
                            <UsersPerProjectChart
                                projectFlagTrends={groupedProjectsData}
                            />
                        </ChartWidget>
                    }
                />
                <Widget {...chartInfo.totalFlags}>
                    <FlagStats
                        count={summary.total}
                        flagsPerUser={
                            showAllProjects ? summary.flagsPerUser : ''
                        }
                    />
                </Widget>
                <ConditionallyRender
                    condition={showAllProjects}
                    show={
                        <ChartWidget {...chartInfo.flags}>
                            <FlagsChart
                                flagTrends={flagTrends}
                                isLoading={loading}
                            />
                        </ChartWidget>
                    }
                    elseShow={
                        <ChartWidget {...chartInfo.flagsPerProject}>
                            <FlagsProjectChart
                                projectFlagTrends={groupedProjectsData}
                            />
                        </ChartWidget>
                    }
                />
                <Widget {...chartInfo.averageHealth}>
                    <HealthStats
                        value={summary.averageHealth}
                        healthy={summary.active}
                        stale={summary.stale}
                        potentiallyStale={summary.potentiallyStale}
                    />
                </Widget>
                <ChartWidget
                    {...(showAllProjects
                        ? chartInfo.overallHealth
                        : chartInfo.healthPerProject)}
                >
                    <ProjectHealthChart
                        projectFlagTrends={groupedProjectsData}
                        isAggregate={showAllProjects}
                    />
                </ChartWidget>
                <Widget {...chartInfo.medianTimeToProduction}>
                    <TimeToProduction
                        daysToProduction={medianTimeToProduction}
                    />
                </Widget>
                <ChartWidget
                    {...(showAllProjects
                        ? chartInfo.timeToProduction
                        : chartInfo.timeToProductionPerProject)}
                >
                    <TimeToProductionChart
                        projectFlagTrends={groupedProjectsData}
                        isAggregate={showAllProjects}
                    />
                </ChartWidget>
            </StyledGrid>
            <Widget
                {...(showAllProjects
                    ? chartInfo.metrics
                    : chartInfo.metricsPerProject)}
            >
                <MetricsSummaryChart
                    metricsSummaryTrends={groupedMetricsData}
                    isAggregate={showAllProjects}
                />
            </Widget>
            <Widget
                {...chartInfo.updates}
                sx={{ mt: (theme) => theme.spacing(2) }}
            >
                <UpdatesPerEnvironmentTypeChart
                    environmentTypeTrends={environmentTypeTrends}
                    isLoading={loading}
                />
            </Widget>
        </>
    );
};
