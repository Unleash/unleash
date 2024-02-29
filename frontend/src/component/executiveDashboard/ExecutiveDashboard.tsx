import { useState, VFC } from 'react';
import { Box, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useExecutiveDashboard } from 'hooks/api/getters/useExecutiveSummary/useExecutiveSummary';

import { useFilteredFlagsSummary } from './hooks/useFilteredFlagsSummary';
import { useFilteredTrends } from './hooks/useFilteredTrends';

import { Widget } from './components/Widget/Widget';
import {
    allOption,
    ProjectSelect,
} from './components/ProjectSelect/ProjectSelect';
import { DashboardHeader } from './components/DashboardHeader/DashboardHeader';

import { UserStats } from './componentsStat/UserStats/UserStats';
import { FlagStats } from './componentsStat/FlagStats/FlagStats';
import { HealthStats } from './componentsStat/HealthStats/HealthStats';
import { TimeToProduction } from './componentsStat/TimeToProduction/TimeToProduction';

import { UsersChart } from './componentsChart/UsersChart/UsersChart';
import { FlagsChart } from './componentsChart/FlagsChart/FlagsChart';
import { FlagsProjectChart } from './componentsChart/FlagsProjectChart/FlagsProjectChart';
import { ProjectHealthChart } from './componentsChart/ProjectHealthChart/ProjectHealthChart';
import { TimeToProductionChart } from './componentsChart/TimeToProductionChart/TimeToProductionChart';
import { MetricsSummaryChart } from './componentsChart/MetricsSummaryChart/MetricsSummaryChart';
import { UsersPerProjectChart } from './componentsChart/UsersPerProjectChart/UsersPerProjectChart';

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
    const [projects, setProjects] = useState([allOption.id]);
    const showAllProjects = projects[0] === allOption.id;
    const projectsData = useFilteredTrends(
        executiveDashboardData.projectFlagTrends,
        projects,
    );
    const metricsData = useFilteredTrends(
        executiveDashboardData.metricsSummaryTrends,
        projects,
    );
    const { users } = executiveDashboardData;

    const summary = useFilteredFlagsSummary(projectsData);

    return (
        <>
            <Box sx={(theme) => ({ paddingBottom: theme.spacing(4) })}>
                <DashboardHeader
                    actions={
                        <ProjectSelect
                            selectedProjects={projects}
                            onChange={setProjects}
                        />
                    }
                />
            </Box>
            <StyledGrid>
                <Widget title='Total users'>
                    <UserStats
                        count={users.total}
                        active={users.active}
                        inactive={users.inactive}
                    />
                </Widget>
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
                <Widget title='Average health'>
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
                >
                    <ProjectHealthChart
                        projectFlagTrends={projectsData}
                        isAggregate={showAllProjects}
                    />
                </ChartWidget>
                {/* <Widget title='Average time to production'>
                    <TimeToProduction
                        //FIXME: data from API
                        daysToProduction={5.2}
                    />
                </Widget>
                <ChartWidget title='Time to production'>
                    <TimeToProductionChart projectFlagTrends={projectsData} />
                </ChartWidget> */}
            </StyledGrid>
            <Widget title='Metrics'>
                <MetricsSummaryChart metricsSummaryTrends={metricsData} />
            </Widget>
        </>
    );
};
