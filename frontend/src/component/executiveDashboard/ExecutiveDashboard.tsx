import { useState, type VFC } from 'react';
import { Box, styled } from '@mui/material';
import { ArrayParam, withDefault } from 'use-query-params';
import { usePersistentTableState } from 'hooks/usePersistentTableState';
import {
    allOption,
    ProjectSelect,
} from 'component/common/ProjectSelect/ProjectSelect';
import { useExecutiveDashboard } from 'hooks/api/getters/useExecutiveSummary/useExecutiveSummary';
import { DashboardHeader } from './components/DashboardHeader/DashboardHeader';
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
import { useAvgTimeToProduction } from './hooks/useAvgTimeToProduction';
import { useFilteredTrends } from './hooks/useFilteredTrends';
import { useGroupedProjectTrends } from './hooks/useGroupedProjectTrends';
import { useFilteredFlagsSummary } from './hooks/useFilteredFlagsSummary';

const StickyWrapper = styled(Box)<{ scrolled?: boolean }>(
    ({ theme, scrolled }) => ({
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        padding: scrolled ? theme.spacing(2, 0) : theme.spacing(0, 0, 2),
        background: theme.palette.background.application,
        transition: 'padding 0.3s ease',
    }),
);

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

const StickyWrapper = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'scrolled',
})<{ scrolled?: boolean }>(({ theme, scrolled }) => ({
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    padding: scrolled ? theme.spacing(2, 0) : theme.spacing(0, 0, 2),
    background: theme.palette.background.application,
    transition: 'padding 0.3s ease',
}));

export const ExecutiveDashboard: VFC = () => {
    const [scrolled, setScrolled] = useState(false);
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
    const isOneProjectSelected = projects.length === 1;

    const projectsData = useFilteredTrends(
        executiveDashboardData.projectFlagTrends,
        projects,
    );

    const groupedProjectsData = useGroupedProjectTrends(projectsData);

    const metricsData = useFilteredTrends(
        executiveDashboardData.metricsSummaryTrends,
        projects,
    );
    const groupedMetricsData = useGroupedProjectTrends(metricsData);

    const { users, environmentTypeTrends, flagTrends, userTrends } =
        executiveDashboardData;

    const summary = useFilteredFlagsSummary(projectsData);

    const avgDaysToProduction = useAvgTimeToProduction(groupedProjectsData);

    const handleScroll = () => {
        if (!scrolled && window.scrollY > 0) {
            setScrolled(true);
        } else if (scrolled && window.scrollY === 0) {
            setScrolled(false);
        }
    };

    if (typeof window !== 'undefined') {
        window.addEventListener('scroll', handleScroll);
    }

    return (
        <>
            <StickyWrapper scrolled={scrolled}>
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
            </StickyWrapper>
            <>
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
                                    userTrends={userTrends}
                                    isLoading={loading}
                                />
                            </ChartWidget>
                        }
                        elseShow={
                            <ChartWidget title='Users per project'>
                                <UsersPerProjectChart
                                    projectFlagTrends={groupedProjectsData}
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
                                    flagTrends={flagTrends}
                                    isLoading={loading}
                                />
                            </ChartWidget>
                        }
                        elseShow={
                            <ChartWidget title='Flags per project'>
                                <FlagsProjectChart
                                    projectFlagTrends={groupedProjectsData}
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
                            showAllProjects
                                ? 'Healthy flags'
                                : 'Health per project'
                        }
                        tooltip='How the health changes over time'
                    >
                        <ProjectHealthChart
                            projectFlagTrends={groupedProjectsData}
                            isAggregate={showAllProjects}
                        />
                    </ChartWidget>
                    <Widget
                        title='Average time to production'
                        tooltip='How long did it take on average from a feature toggle was created until it was enabled in an environment of type production. This is calculated only from feature toggles with the type of "release" and averaged across selected projects.  '
                    >
                        <TimeToProduction
                            daysToProduction={avgDaysToProduction}
                        />
                    </Widget>
                    <ChartWidget
                        title={
                            showAllProjects
                                ? 'Time to production'
                                : 'Time to production per project'
                        }
                        tooltip='How the time to production changes over time'
                    >
                        <TimeToProductionChart
                            projectFlagTrends={groupedProjectsData}
                            isAggregate={showAllProjects}
                        />
                    </ChartWidget>
                </StyledGrid>
                <Widget
                    title={showAllProjects ? 'Metrics' : 'Metrics per project'}
                    tooltip='Summary of all flag evaluations reported by SDKs.'
                >
                    <MetricsSummaryChart
                        metricsSummaryTrends={groupedMetricsData}
                        isAggregate={showAllProjects}
                    />
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
        </>
    );
};
