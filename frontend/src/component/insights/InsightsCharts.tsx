import type { VFC } from 'react';
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

const StyledContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

export const InsightsCharts: VFC<IChartsProps> = ({
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
            <StyledContainer>
                <ConditionallyRender
                    condition={showAllProjects}
                    show={
                        <Widget
                            title='Total users'
                            tooltip='Total number of current users.'
                        >
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
                            title={
                                isOneProjectSelected
                                    ? 'Users in project'
                                    : 'Users per project on average'
                            }
                            tooltip={
                                isOneProjectSelected
                                    ? 'Average number of users for selected projects.'
                                    : 'Number of users in selected projects.'
                            }
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
                        <Widget
                            title='Users'
                            tooltip='How the number of users changes over time.'
                        >
                            <UsersChart
                                userTrends={userTrends}
                                isLoading={loading}
                            />
                        </Widget>
                    }
                    elseShow={
                        <Widget
                            title='Users per project'
                            tooltip='How the number of users changes over time for the selected projects.'
                        >
                            <UsersPerProjectChart
                                projectFlagTrends={groupedProjectsData}
                                isLoading={loading}
                            />
                        </Widget>
                    }
                />
                <Widget
                    title='Total flags'
                    tooltip='Active flags (not archived) that currently exist across the selected projects.'
                >
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
                        <Widget
                            title='Number of flags'
                            tooltip='How the number of flags has changed over time across all projects.'
                        >
                            <FlagsChart
                                flagTrends={flagTrends}
                                isLoading={loading}
                            />
                        </Widget>
                    }
                    elseShow={
                        <Widget
                            title='Flags per project'
                            tooltip='How the number of flags changes over time for the selected projects.'
                        >
                            <FlagsProjectChart
                                projectFlagTrends={groupedProjectsData}
                                isLoading={loading}
                            />
                        </Widget>
                    }
                />
                <ConditionallyRender
                    condition={isEnterprise()}
                    show={
                        <>
                            <Widget
                                title='Average health'
                                tooltip='Average health is the current percentage of flags in the selected projects that are not stale or potentially stale.'
                            >
                                <HealthStats
                                    value={summary.averageHealth}
                                    healthy={summary.active}
                                    stale={summary.stale}
                                    potentiallyStale={summary.potentiallyStale}
                                />
                            </Widget>
                            <Widget
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
                            >
                                <ProjectHealthChart
                                    projectFlagTrends={groupedProjectsData}
                                    isAggregate={showAllProjects}
                                    isLoading={loading}
                                />
                            </Widget>
                            <Widget
                                title='Median time to production'
                                tooltip={`How long does it currently take on average from when a feature flag was created until it was enabled in a "production" type environment. This is calculated only from feature flags of the type "release" and is the median across the selected projects.`}
                            >
                                <TimeToProduction
                                    daysToProduction={
                                        summary.medianTimeToProduction
                                    }
                                />
                            </Widget>
                            <Widget
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
                            >
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
                            <Widget
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
                            >
                                <MetricsSummaryChart
                                    metricsSummaryTrends={groupedMetricsData}
                                    allDatapointsSorted={allMetricsDatapoints}
                                    isAggregate={showAllProjects}
                                    isLoading={loading}
                                />
                            </Widget>
                            <Widget
                                title='Updates per environment type'
                                tooltip='Summary of all configuration updates per environment type.'
                            >
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
