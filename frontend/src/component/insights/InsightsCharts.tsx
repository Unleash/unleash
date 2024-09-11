import type { FC } from 'react';
import { Box, Paper, Tooltip, styled } from '@mui/material';
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
import { allOption } from 'component/common/ProjectSelect/ProjectSelect';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { WidgetTitle } from './components/WidgetTitle/WidgetTitle';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import ActivityCalendar, { type ThemeInput } from 'react-activity-calendar';
import { useEventSearch } from '../../hooks/api/getters/useEventSearch/useEventSearch';

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
    gap: theme.spacing(2),
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

type Input = { createdAt: string };
type Output = { date: string; count: number; level: number };

function transformData(inputData: Input[]): Output[] {
    const resultMap: Record<string, number> = {};

    // Step 1: Count the occurrences of each date
    inputData.forEach((item) => {
        const formattedDate = new Date(item.createdAt)
            .toISOString()
            .split('T')[0];
        resultMap[formattedDate] = (resultMap[formattedDate] || 0) + 1;
    });

    // Step 2: Get all counts, sort them, and find the cut-off values for percentiles
    const counts = Object.values(resultMap).sort((a, b) => a - b);

    const percentile = (percent: number) => {
        const index = Math.floor((percent / 100) * counts.length);
        return counts[index] || counts[counts.length - 1];
    };

    const thresholds = [
        percentile(25), // 25th percentile
        percentile(50), // 50th percentile
        percentile(75), // 75th percentile
        percentile(100), // 100th percentile
    ];

    // Step 3: Assign a level based on the percentile thresholds
    const calculateLevel = (count: number): number => {
        if (count <= thresholds[0]) return 1; // 1-25%
        if (count <= thresholds[1]) return 2; // 26-50%
        if (count <= thresholds[2]) return 3; // 51-75%
        return 4; // 76-100%
    };

    // Step 4: Convert the map back to an array and assign levels
    return Object.entries(resultMap)
        .map(([date, count]) => ({
            date,
            count,
            level: calculateLevel(count),
        }))
        .reverse(); // Optional: reverse the order if needed
}

export const InsightsCharts: FC<IChartsProps> = ({
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

    const explicitTheme: ThemeInput = {
        light: ['#f1f0fc', '#ceccfd', '#8982ff', '#6c65e5', '#615bc2'],
        dark: ['#f1f0fc', '#ceccfd', '#8982ff', '#6c65e5', '#615bc2'],
    };

    const { events } = useEventSearch({ limit: '1000' });
    const { events: events1 } = useEventSearch({
        limit: '1000',
        offset: '1000',
    });
    const { events: events2 } = useEventSearch({
        limit: '1000',
        offset: '2000',
    });
    const { events: events3 } = useEventSearch({
        limit: '1000',
        offset: '3000',
    });
    const { events: events4 } = useEventSearch({
        limit: '1000',
        offset: '4000',
    });
    const { events: events5 } = useEventSearch({
        limit: '1000',
        offset: '5000',
    });
    const { events: events6 } = useEventSearch({
        limit: '1000',
        offset: '6000',
    });
    const { events: events7 } = useEventSearch({
        limit: '1000',
        offset: '7000',
    });
    const { events: events8 } = useEventSearch({
        limit: '1000',
        offset: '8000',
    });
    const { events: events9 } = useEventSearch({
        limit: '1000',
        offset: '9000',
    });

    let data = transformData([
        ...events,
        ...events1,
        ...events2,
        ...events3,
        ...events4,
        ...events5,
        ...events6,
        ...events7,
        ...events8,
        ...events9,
    ]);
    data =
        data.length > 0
            ? data
            : [
                  {
                      date: '2022-12-14',
                      count: 2,
                      level: 1,
                  },
                  {
                      date: '2024-06-22',
                      count: 16,
                      level: 3,
                  },
              ];

    console.log(data);

    return (
        <StyledContainer>
            <ConditionallyRender
                condition={showAllProjects}
                show={
                    <>
                        <StyledWidget sx={{ p: 3 }}>
                            <ActivityCalendar
                                theme={explicitTheme}
                                data={data}
                                maxLevel={4}
                                showWeekdayLabels={true}
                                renderBlock={(block, activity) => (
                                    <Tooltip
                                        title={`${activity.count} activities on ${activity.date}`}
                                    >
                                        {block}
                                    </Tooltip>
                                )}
                            />
                        </StyledWidget>
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
                    </>
                }
                elseShow={
                    <>
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
                    </>
                }
            />
            <ConditionallyRender
                condition={isEnterprise()}
                show={
                    <>
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
                        <StyledWidget>
                            <StyledWidgetStats>
                                <WidgetTitle
                                    title='Median time to production'
                                    tooltip={`How long does it currently take on average from when a feature flag was created until it was enabled in a "production" type environment. This is calculated only from feature flags of the type "release" and is the median across the selected projects.`}
                                />
                                <TimeToProduction
                                    daysToProduction={
                                        summary.medianTimeToProduction
                                    }
                                />
                            </StyledWidgetStats>
                            <StyledChartContainer>
                                <TimeToProductionChart
                                    projectFlagTrends={groupedProjectsData}
                                    isAggregate={showAllProjects}
                                    isLoading={loading}
                                />
                            </StyledChartContainer>
                        </StyledWidget>
                    </>
                }
            />
            <ConditionallyRender
                condition={showAllProjects}
                show={
                    <>
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
                    </>
                }
                elseShow={
                    <>
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
                    </>
                }
            />
            <ConditionallyRender
                condition={isEnterprise()}
                show={
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
                }
            />
        </StyledContainer>
    );
};
