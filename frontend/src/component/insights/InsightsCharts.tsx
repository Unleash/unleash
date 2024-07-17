import type { FC } from 'react';
import { Box, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
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
import type {
    InstanceInsightsSchema,
    InstanceInsightsSchemaFlags,
    InstanceInsightsSchemaUsers,
} from 'openapi';
import type { GroupedDataByProject } from './hooks/useGroupedProjectTrends';
import { allOption } from 'component/common/ProjectSelect/ProjectSelect';
import { chartInfo } from './chart-info';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

interface IChartsProps {
    flags: InstanceInsightsSchema['flags'];
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
        medianTimeToProduction?: number;
    };
    loading: boolean;
    projects: string[];
    allMetricsDatapoints: string[];
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

export const InsightsCharts: FC<IChartsProps> = ({
    projects,
    flags,
    users,
    summary,
    userTrends,
    groupedProjectsData,
    flagTrends,
    groupedMetricsData,
    environmentTypeTrends,
    allMetricsDatapoints,
    loading,
}) => {
    const { isEnterprise } = useUiConfig();
    const showAllProjects = projects[0] === allOption.id;
    const isOneProjectSelected = projects.length === 1;

    function getFlagsPerUser(
        flags: InstanceInsightsSchemaFlags,
        users: InstanceInsightsSchemaUsers,
    ) {
        const flagsPerUserCalculation = flags.total / users.total;
        return Number.isNaN(flagsPerUserCalculation)
            ? 'N/A'
            : flagsPerUserCalculation.toFixed(2);
    }

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
                                isLoading={loading}
                            />
                        </Widget>
                    }
                    elseShow={
                        <Widget
                            {...(isOneProjectSelected
                                ? chartInfo.usersInProject
                                : chartInfo.avgUsersPerProject)}
                        >
                            <UserStats
                                count={summary.averageUsers}
                                isLoading={loading}
                            />
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
                                isLoading={loading}
                            />
                        </ChartWidget>
                    }
                />
                <Widget {...chartInfo.totalFlags}>
                    <FlagStats
                        count={showAllProjects ? flags.total : summary.total}
                        flagsPerUser={
                            showAllProjects ? getFlagsPerUser(flags, users) : ''
                        }
                        isLoading={loading}
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
                                isLoading={loading}
                            />
                        </ChartWidget>
                    }
                />
                <ConditionallyRender
                    condition={isEnterprise()}
                    show={
                        <>
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
                                    isLoading={loading}
                                />
                            </ChartWidget>
                            <Widget {...chartInfo.medianTimeToProduction}>
                                <TimeToProduction
                                    daysToProduction={
                                        summary.medianTimeToProduction
                                    }
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
                                    isLoading={loading}
                                />
                            </ChartWidget>
                        </>
                    }
                />
            </StyledGrid>
            <ConditionallyRender
                condition={isEnterprise()}
                show={
                    <>
                        <Widget
                            {...(showAllProjects
                                ? chartInfo.metrics
                                : chartInfo.metricsPerProject)}
                        >
                            <MetricsSummaryChart
                                metricsSummaryTrends={groupedMetricsData}
                                allDatapointsSorted={allMetricsDatapoints}
                                isAggregate={showAllProjects}
                                isLoading={loading}
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
                }
            />
        </>
    );
};
