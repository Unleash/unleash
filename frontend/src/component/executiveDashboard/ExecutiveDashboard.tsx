import { VFC } from 'react';
import { Box, styled } from '@mui/material';
import { ArrayParam, withDefault } from 'use-query-params';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { usePersistentTableState } from 'hooks/usePersistentTableState';
import {
    allOption,
    ProjectSelect,
} from 'component/common/ProjectSelect/ProjectSelect';
import { useExecutiveDashboard } from 'hooks/api/getters/useExecutiveSummary/useExecutiveSummary';

import { useFilteredFlagsSummary } from './hooks/useFilteredFlagsSummary';
import { useFilteredTrends } from './hooks/useFilteredTrends';

import { Widget } from './components/Widget/Widget';
import { DashboardHeader } from './components/DashboardHeader/DashboardHeader';

import { UserStats } from './componentsStat/UserStats/UserStats';
import { FlagStats } from './componentsStat/FlagStats/FlagStats';
import { HealthStats } from './componentsStat/HealthStats/HealthStats';

import { UsersChart } from './componentsChart/UsersChart/UsersChart';
import { FlagsChart } from './componentsChart/FlagsChart/FlagsChart';
import { FlagsProjectChart } from './componentsChart/FlagsProjectChart/FlagsProjectChart';
import { ProjectHealthChart } from './componentsChart/ProjectHealthChart/ProjectHealthChart';
import { MetricsSummaryChart } from './componentsChart/MetricsSummaryChart/MetricsSummaryChart';
import { UsersPerProjectChart } from './componentsChart/UsersPerProjectChart/UsersPerProjectChart';
import { UpdatesPerEnvironmentTypeChart } from './componentsChart/UpdatesPerEnvironmentTypeChart/UpdatesPerEnvironmentTypeChart';

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

export const ExecutiveDashboard: VFC = () => {
    const { executiveDashboardData, loading, error } = useExecutiveDashboard();
    const stateConfig = {
        projects: withDefault(ArrayParam, [allOption.id]),
    };
    const [state, setState] = usePersistentTableState('insights', stateConfig);
    const setProjects = (projects: string[]) => {
        setState({ projects });
    };
    const projects = state.projects
        ? (state.projects.filter(Boolean) as string[])
        : [];
    const showAllProjects = projects[0] === allOption.id;
    const projectsData = useFilteredTrends(
        executiveDashboardData.projectFlagTrends,
        projects,
    );
    const metricsData = useFilteredTrends(
        executiveDashboardData.metricsSummaryTrends,
        projects,
    );

    const { users, environmentTypeTrends } = executiveDashboardData;

    const summary = useFilteredFlagsSummary(projectsData);
    const isOneProjectSelected = projects.length === 1;

    return (
        <>
            <Box sx={(theme) => ({ paddingBottom: theme.spacing(4) })}>
                <DashboardHeader
                    actions={
                        <ProjectSelect
                            selectedProjects={projects}
                            onChange={setProjects}
                            dataTestId={'DASHBOARD_PROJECT_SELECT'}
                            sx={{ flex: 1, maxWidth: '360px', width: '100%' }}
                        />
                    }
                />
            </Box>
            <StyledGrid>
                <ConditionallyRender
                    condition={showAllProjects}
                    show={
                        <Widget title='Total users'>
                            <UserStats
                                count={users.total}
                                active={users.active}
                                inactive={users.inactive}
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
                        >
                            <UserStats count={summary.averageUsers} />
                        </Widget>
                    }
                />
                <ConditionallyRender
                    condition={showAllProjects}
                    show={
                        <ChartWidget title='Users'>
                            <UsersChart
                                userTrends={executiveDashboardData.userTrends}
                                isLoading={loading}
                            />
                        </ChartWidget>
                    }
                    elseShow={
                        <ChartWidget title='Users per project'>
                            <UsersPerProjectChart
                                projectFlagTrends={projectsData}
                            />
                        </ChartWidget>
                    }
                />
                <Widget
                    title='Total flags'
                    tooltip='Active flags (not archived) that currently exist across selected projects.'
                >
                    <FlagStats
                        count={summary.total}
                        flagsPerUser={
                            showAllProjects
                                ? (summary.total / users.total).toFixed(2)
                                : ''
                        }
                    />
                </Widget>
                <ConditionallyRender
                    condition={showAllProjects}
                    show={
                        <ChartWidget title='Number of flags'>
                            <FlagsChart
                                flagTrends={executiveDashboardData.flagTrends}
                                isLoading={loading}
                            />
                        </ChartWidget>
                    }
                    elseShow={
                        <ChartWidget title='Flags per project'>
                            <FlagsProjectChart
                                projectFlagTrends={projectsData}
                            />
                        </ChartWidget>
                    }
                />
                <Widget
                    title='Average health'
                    tooltip='Average health is a percentage of flags that are not stale nor potencially stale.'
                >
                    <HealthStats
                        value={summary.averageHealth}
                        healthy={summary.active}
                        stale={summary.stale}
                        potentiallyStale={summary.potentiallyStale}
                    />
                </Widget>
                <ChartWidget
                    title={
                        showAllProjects ? 'Healthy flags' : 'Health per project'
                    }
                >
                    <ProjectHealthChart
                        projectFlagTrends={projectsData}
                        isAggregate={showAllProjects}
                    />
                </ChartWidget>
                {/* <Widget title='Average time to production'>
                    <TimeToProduction
                        //FIXME: data from API
                        daysToProduction={5.2}
                    />
                </Widget>
                <ChartWidget title='Time to production'>
                    <TimeToProductionChart projectFlagTrends={projectsData} />
                </ChartWidget> */}
            </StyledGrid>
            <Widget
                title='Metrics'
                tooltip='Summary of all flag evaluations reported by SDKs.'
            >
                <MetricsSummaryChart metricsSummaryTrends={metricsData} />
            </Widget>
            <Widget
                title='Updates per environment type'
                tooltip='Summary of all configuration updates per environment type'
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
