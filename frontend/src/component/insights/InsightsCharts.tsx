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
import { useEvents } from 'hooks/api/getters/useEvents/useEvents';

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

    inputData.forEach((item) => {
        // Parse the string as a Date and format it as 'YYYY-MM-DD'
        const formattedDate = new Date(item.createdAt)
            .toISOString()
            .split('T')[0];

        // If the date already exists in the map, increment its count
        if (resultMap[formattedDate]) {
            resultMap[formattedDate]++;
        } else {
            // Otherwise, initialize it with a count of 1
            resultMap[formattedDate] = 1;
        }
    });

    // Calculate the max count, excluding zero
    const maxCount = Math.max(...Object.values(resultMap));

    // Define a function to calculate the level based on count
    const calculateLevel = (count: number): number => {
        if (count === 0) {
            return 0; // Separate bucket for zero
        }
        const bucketSize = maxCount / 4; // Divide non-zero counts into 4 levels
        return Math.min(Math.ceil(count / bucketSize), 4); // Ensure max level is 4
    };

    // Convert the map back to an array of objects with 'date', 'count', and 'level'
    return Object.entries(resultMap).map(([date, count]) => ({
        date,
        count,
        level: calculateLevel(count),
    }));
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
        light: ['#f0f0f0', '#c4edde', '#7ac7c4', '#f73859', '#384259'],
        dark: ['#383838', '#4D455D', '#7DB9B6', '#F5E9CF', '#E96479'],
    };

    const { events } = useEvents();

    let data = transformData(events);
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
