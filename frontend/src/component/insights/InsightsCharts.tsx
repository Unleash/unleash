import type { FC, ReactNode } from 'react';
import { Box, Paper, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
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
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { WidgetTitle } from './components/WIdgetTitle/WIdgetTitle';

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

const StyledContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const Widget = styled(Paper)(({ theme }) => ({
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
    boxShadow: 'none',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.up('md')]: {
        flexDirection: 'row',
    },
    alignItems: 'stretch',
}));

const StyledChartContainer = styled(Box)(({ theme }) => ({
    position: 'relative',
    minWidth: 0, // bugfix, see: https://github.com/chartjs/Chart.js/issues/4156#issuecomment-295180128
    flexGrow: 1,
    margin: 'auto 0',
    padding: theme.spacing(3),
    [theme.breakpoints.up('md')]: {
        borderLeft: `1px solid ${theme.palette.background.application}`,
    },
}));

const StyledUsersStats = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(3),
    [theme.breakpoints.up('md')]: {
        minWidth: '300px',
    },
}));

const StyledFlagsStats = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(3),
    [theme.breakpoints.up('md')]: {
        minWidth: '250px',
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

    if (showAllProjects) {
        return (
            <StyledContainer>
                <Widget>
                    <StyledUsersStats>
                        <WidgetTitle title='Total users' />
                        <UserStats
                            count={users.total}
                            active={users.active}
                            inactive={users.inactive}
                            isLoading={loading}
                        />
                    </StyledUsersStats>
                    <StyledChartContainer>
                        <UsersChart
                            userTrends={userTrends}
                            isLoading={loading}
                        />
                    </StyledChartContainer>
                </Widget>

                <Widget>
                    <StyledFlagsStats>
                        <WidgetTitle title='Flags' />
                        <FlagStats
                            count={flags.total}
                            flagsPerUser={getFlagsPerUser(flags, users)}
                            isLoading={loading}
                        />
                    </StyledFlagsStats>
                    <StyledChartContainer>
                        <FlagsChart
                            flagTrends={flagTrends}
                            isLoading={loading}
                        />
                    </StyledChartContainer>
                </Widget>
            </StyledContainer>
        );
    }

    return (
        <StyledContainer>
            <Widget>
                <StyledUsersStats>
                    <WidgetTitle
                        title={
                            isOneProjectSelected
                                ? 'Users in project'
                                : 'Users per project on average'
                        }
                        tooltip={
                            isOneProjectSelected
                                ? 'Number of users in selected projects.'
                                : 'Average number of users for selected projects.'
                        }
                    />
                    <UserStats
                        count={summary.averageUsers}
                        isLoading={loading}
                    />
                </StyledUsersStats>
                <StyledChartContainer>
                    <UsersPerProjectChart
                        projectFlagTrends={groupedProjectsData}
                        isLoading={loading}
                    />
                </StyledChartContainer>
            </Widget>
            <Widget>
                <StyledFlagsStats>
                    <WidgetTitle title='Flags' />
                    {/* <WidgetTitle
                            title='Number of flags'
                            tooltip='How the number of flags has changed over time across all projects.'
                        />
                        <WidgetTitle
                            title='Flags per project'
                            tooltip='How the number of flags changes over time for the selected projects.'
                        /> */}
                    <FlagStats
                        count={summary.total}
                        flagsPerUser={''}
                        isLoading={loading}
                    />
                </StyledFlagsStats>
                <StyledChartContainer>
                    <FlagsProjectChart
                        projectFlagTrends={groupedProjectsData}
                        isLoading={loading}
                    />
                </StyledChartContainer>
            </Widget>
        </StyledContainer>
    );

    return (
        <>
            <StyledContainer>
                <ConditionallyRender
                    condition={isEnterprise()}
                    show={
                        <>
                            <Widget>
                                <WidgetTitle
                                    title='Average health'
                                    tooltip='Average health is the current percentage of flags in the selected projects that are not stale or potentially stale.'
                                />
                                <HealthStats
                                    value={summary.averageHealth}
                                    healthy={summary.active}
                                    stale={summary.stale}
                                    potentiallyStale={summary.potentiallyStale}
                                />
                            </Widget>
                            <Widget>
                                <WidgetTitle
                                    title={
                                        showAllProjects
                                            ? 'Overall Health'
                                            : 'Health per project'
                                    }
                                    tooltip={
                                        showAllProjects
                                            ? 'How the overall health changes over time across all projects.'
                                            : 'How the overall health changes over time for the selected projects.'
                                    }
                                />
                                <ProjectHealthChart
                                    projectFlagTrends={groupedProjectsData}
                                    isAggregate={showAllProjects}
                                    isLoading={loading}
                                />
                            </Widget>
                            <Widget>
                                <WidgetTitle
                                    title='Median time to production'
                                    tooltip={`How long does it currently take on average from when a feature flag was created until it was enabled in a "production" type environment. This is calculated only from feature flags of the type "release" and is the median across the selected projects.`}
                                />
                                <TimeToProduction
                                    daysToProduction={
                                        summary.medianTimeToProduction
                                    }
                                />
                            </Widget>
                            <Widget>
                                <WidgetTitle
                                    title={
                                        showAllProjects
                                            ? 'Time to production'
                                            : 'Time to production per project'
                                    }
                                    tooltip={
                                        showAllProjects
                                            ? 'How the median time to production changes over time across all projects.'
                                            : 'How the average time to production changes over time for the selected projects.'
                                    }
                                />
                                <TimeToProductionChart
                                    projectFlagTrends={groupedProjectsData}
                                    isAggregate={showAllProjects}
                                    isLoading={loading}
                                />
                            </Widget>
                        </>
                    }
                />
                <ConditionallyRender
                    condition={isEnterprise()}
                    show={
                        <>
                            <Widget>
                                <WidgetTitle
                                    title={
                                        showAllProjects
                                            ? 'Flag evaluation metrics'
                                            : 'Flag evaluation metrics per project'
                                    }
                                    tooltip={
                                        showAllProjects
                                            ? 'Summary of all flag evaluations reported by SDKs across all projects.'
                                            : 'Summary of all flag evaluations reported by SDKs for the selected projects.'
                                    }
                                />
                                <MetricsSummaryChart
                                    metricsSummaryTrends={groupedMetricsData}
                                    allDatapointsSorted={allMetricsDatapoints}
                                    isAggregate={showAllProjects}
                                    isLoading={loading}
                                />
                            </Widget>
                            <Widget>
                                <WidgetTitle
                                    title='Updates per environment type'
                                    tooltip='Summary of all configuration updates per environment type.'
                                />
                                <UpdatesPerEnvironmentTypeChart
                                    environmentTypeTrends={
                                        environmentTypeTrends
                                    }
                                    isLoading={loading}
                                />
                            </Widget>
                        </>
                    }
                />
            </StyledContainer>
        </>
    );
};
