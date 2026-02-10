import { allOption } from 'component/common/ProjectSelect/ProjectSelect';
import { format, subMonths } from 'date-fns';
import { useInsights } from 'hooks/api/getters/useInsights/useInsights';
import { usePersistentTableState } from 'hooks/usePersistentTableState';
import type { FC } from 'react';
import { withDefault } from 'use-query-params';
import { FilterItemParam } from 'utils/serializeQueryParams';
import { handleDateAdjustment } from 'component/events/EventLog/useEventLogSearch';
import { WidgetTitle } from 'component/insights/components/WidgetTitle/WidgetTitle';
import { UsersChart } from 'component/insights/componentsChart/UsersChart/UsersChart';
import { UsersPerProjectChart } from 'component/insights/componentsChart/UsersPerProjectChart/UsersPerProjectChart';
import { UserStats } from 'component/insights/componentsStat/UserStats/UserStats';
import { useInsightsData } from 'component/insights/hooks/useInsightsData';
import {
    StyledChartContainer,
    StyledWidget,
    StyledWidgetStats,
} from 'component/insights/InsightsCharts.styles';
import { InsightsSection } from 'component/insights/sections/InsightsSection';
import { InsightsFilters } from 'component/insights/InsightsFilters';

export const UserInsights: FC = () => {
    const statePrefix = 'users-';
    const stateConfig = {
        [`${statePrefix}project`]: FilterItemParam,
        [`${statePrefix}from`]: withDefault(FilterItemParam, {
            values: [format(subMonths(new Date(), 1), 'yyyy-MM-dd')],
            operator: 'IS',
        }),
        [`${statePrefix}to`]: withDefault(FilterItemParam, {
            values: [format(new Date(), 'yyyy-MM-dd')],
            operator: 'IS',
        }),
    };
    const [state, setStateRaw] = usePersistentTableState(
        'insights-users',
        stateConfig,
        ['users-from', 'users-to'],
    );

    const setState = (newState: typeof state) => {
        setStateRaw((oldState) =>
            handleDateAdjustment(oldState, newState, statePrefix),
        );
    };

    const { insights, loading } = useInsights(
        state['users-from']?.values[0],
        state['users-to']?.values[0],
    );

    const projects = state['users-project']?.values ?? [allOption.id];

    const showAllProjects = projects[0] === allOption.id;
    const { summary, groupedProjectsData, userTrends } = useInsightsData(
        insights,
        projects,
    );

    const lastUserTrend = userTrends[userTrends.length - 1];
    const usersTotal = lastUserTrend?.total ?? 0;
    const usersActive = lastUserTrend?.active ?? 0;
    const usersInactive = lastUserTrend?.inactive ?? 0;

    const isOneProjectSelected = projects.length === 1;

    return (
        <InsightsSection
            title='User insights'
            filters={
                <InsightsFilters
                    state={state}
                    onChange={setState}
                    filterNamePrefix={statePrefix}
                />
            }
        >
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
        </InsightsSection>
    );
};
