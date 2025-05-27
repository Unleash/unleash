import type { FC, PropsWithChildren } from 'react';
import { Box, Paper, styled } from '@mui/material';
import { UserStats } from './componentsStat/UserStats/UserStats.tsx';
import { UsersChart } from './componentsChart/UsersChart/UsersChart.tsx';
import { UsersPerProjectChart } from './componentsChart/UsersPerProjectChart/UsersPerProjectChart.tsx';
import { FlagStats } from './componentsStat/FlagStats/FlagStats.tsx';
import { FlagsChart } from './componentsChart/FlagsChart/FlagsChart.tsx';
import { FlagsProjectChart } from './componentsChart/FlagsProjectChart/FlagsProjectChart.tsx';
import { HealthStats } from './componentsStat/HealthStats/HealthStats.tsx';
import { ProjectHealthChart } from './componentsChart/ProjectHealthChart/ProjectHealthChart.tsx';
import { MetricsSummaryChart } from './componentsChart/MetricsSummaryChart/MetricsSummaryChart.tsx';
import { UpdatesPerEnvironmentTypeChart } from './componentsChart/UpdatesPerEnvironmentTypeChart/UpdatesPerEnvironmentTypeChart.tsx';
import type { InstanceInsightsSchema } from 'openapi';
import type { GroupedDataByProject } from './hooks/useGroupedProjectTrends.ts';
import { allOption } from 'component/common/ProjectSelect/ProjectSelect';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { WidgetTitle } from './components/WidgetTitle/WidgetTitle.tsx';
import { useUiFlag } from 'hooks/useUiFlag.ts';
import { LegacyInsightsCharts } from './LegacyInsightsCharts.tsx';

export interface IChartsProps {
    flagTrends: InstanceInsightsSchema['flagTrends'];
    projectsData: InstanceInsightsSchema['projectFlagTrends'];
    groupedProjectsData: GroupedDataByProject<
        InstanceInsightsSchema['projectFlagTrends']
    >;
    metricsData: InstanceInsightsSchema['metricsSummaryTrends'];
    groupedMetricsData: GroupedDataByProject<
        InstanceInsightsSchema['metricsSummaryTrends']
    >;
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
    gap: theme.spacing(4),
}));

const StyledWidget = styled(Paper)(({ theme }) => ({
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
    boxShadow: 'none',
    display: 'flex',
    flexWrap: 'wrap',
    [theme.breakpoints.up('md')]: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
    },
}));

const StyledWidgetContent = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    width: '100%',
}));

const StyledWidgetStats = styled(Box)<{ width?: number; padding?: number }>(
    ({ theme, width = 300, padding = 3 }) => ({
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(2),
        padding: theme.spacing(padding),
        minWidth: '100%',
        [theme.breakpoints.up('md')]: {
            minWidth: `${width}px`,
            borderRight: `1px solid ${theme.palette.background.application}`,
        },
    }),
);

const StyledChartContainer = styled(Box)(({ theme }) => ({
    position: 'relative',
    minWidth: 0, // bugfix, see: https://github.com/chartjs/Chart.js/issues/4156#issuecomment-295180128
    flexGrow: 1,
    margin: 'auto 0',
    padding: theme.spacing(3),
}));

const StyledSection = styled('section')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const Section: FC<PropsWithChildren<{ title: string }>> = ({
    title,
    children,
}) => (
    <StyledSection>
        <h2>{title}</h2>
        {children}
    </StyledSection>
);

const NewInsightsCharts: FC<IChartsProps> = ({
    projects,
    summary,
    userTrends,
    groupedProjectsData,
    flagTrends,
    groupedMetricsData,
    environmentTypeTrends,
    allMetricsDatapoints,
    loading,
}) => {
    const showAllProjects = projects[0] === allOption.id;
    const isOneProjectSelected = projects.length === 1;
    const { isEnterprise } = useUiConfig();

    const lastUserTrend = userTrends[userTrends.length - 1];
    const lastFlagTrend = flagTrends[flagTrends.length - 1];

    const usersTotal = lastUserTrend?.total ?? 0;
    const usersActive = lastUserTrend?.active ?? 0;
    const usersInactive = lastUserTrend?.inactive ?? 0;
    const flagsTotal = lastFlagTrend?.total ?? 0;

    function getFlagsPerUser(flagsTotal: number, usersTotal: number) {
        const flagsPerUserCalculation = flagsTotal / usersTotal;
        return Number.isNaN(flagsPerUserCalculation)
            ? 'N/A'
            : flagsPerUserCalculation.toFixed(2);
    }

    return (
        <StyledContainer>
            <Section title='Flags lifecycle currently' />
            <Section title='Performance insights'>
                {showAllProjects ? (
                    <StyledWidget>
                        <StyledWidgetStats width={275}>
                            <WidgetTitle title='Flags' />
                            <FlagStats
                                count={flagsTotal}
                                flagsPerUser={getFlagsPerUser(
                                    flagsTotal,
                                    usersTotal,
                                )}
                                isLoading={loading}
                            />
                        </StyledWidgetStats>
                        <StyledChartContainer>
                            <FlagsChart
                                flagTrends={flagTrends}
                                isLoading={loading}
                            />
                        </StyledChartContainer>
                    </StyledWidget>
                ) : (
                    <StyledWidget>
                        <StyledWidgetStats width={275}>
                            <WidgetTitle title='Flags' />
                            <FlagStats
                                count={summary.total}
                                flagsPerUser={''}
                                isLoading={loading}
                            />
                        </StyledWidgetStats>
                        <StyledChartContainer>
                            <FlagsProjectChart
                                projectFlagTrends={groupedProjectsData}
                                isLoading={loading}
                            />
                        </StyledChartContainer>
                    </StyledWidget>
                )}
                {isEnterprise() ? (
                    <StyledWidget>
                        <StyledWidgetStats width={350} padding={0}>
                            <HealthStats
                                value={summary.averageHealth}
                                healthy={summary.active}
                                stale={summary.stale}
                                potentiallyStale={summary.potentiallyStale}
                                title={
                                    <WidgetTitle
                                        title='Health'
                                        tooltip={
                                            'Percentage of flags that are not stale or potentially stale.'
                                        }
                                    />
                                }
                            />
                        </StyledWidgetStats>
                        <StyledChartContainer>
                            <ProjectHealthChart
                                projectFlagTrends={groupedProjectsData}
                                isAggregate={showAllProjects}
                                isLoading={loading}
                            />
                        </StyledChartContainer>
                    </StyledWidget>
                ) : null}
                {isEnterprise() ? (
                    <>
                        <StyledWidget>
                            <StyledWidgetContent>
                                <WidgetTitle
                                    title='Flag evaluation metrics'
                                    tooltip='Summary of all flag evaluations reported by SDKs.'
                                />
                                <StyledChartContainer>
                                    <MetricsSummaryChart
                                        metricsSummaryTrends={
                                            groupedMetricsData
                                        }
                                        allDatapointsSorted={
                                            allMetricsDatapoints
                                        }
                                        isAggregate={showAllProjects}
                                        isLoading={loading}
                                    />
                                </StyledChartContainer>
                            </StyledWidgetContent>
                        </StyledWidget>
                        <StyledWidget>
                            <StyledWidgetContent>
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
                            </StyledWidgetContent>
                        </StyledWidget>
                    </>
                ) : null}
            </Section>

            <Section title='User insights'>
                {showAllProjects ? (
                    <StyledWidget>
                        <StyledWidgetStats>
                            <WidgetTitle title='Total users' />
                            <UserStats
                                count={usersTotal}
                                active={usersActive}
                                inactive={usersInactive}
                                isLoading={loading}
                            />
                        </StyledWidgetStats>
                        <StyledChartContainer>
                            <UsersChart
                                userTrends={userTrends}
                                isLoading={loading}
                            />
                        </StyledChartContainer>
                    </StyledWidget>
                ) : (
                    <StyledWidget>
                        <StyledWidgetStats>
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
                        </StyledWidgetStats>
                        <StyledChartContainer>
                            <UsersPerProjectChart
                                projectFlagTrends={groupedProjectsData}
                                isLoading={loading}
                            />
                        </StyledChartContainer>
                    </StyledWidget>
                )}
            </Section>
        </StyledContainer>
    );
};

export const InsightsCharts: FC<IChartsProps> = (props) => {
    const useNewInsightsCharts = useUiFlag('lifecycleMetrics');

    return useNewInsightsCharts ? (
        <NewInsightsCharts {...props} />
    ) : (
        <LegacyInsightsCharts {...props} />
    );
};
