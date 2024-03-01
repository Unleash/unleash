import { useMemo, useState, VFC } from 'react';
import {
    Box,
    styled,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { UsersChart } from './UsersChart/UsersChart';
import { FlagsChart } from './FlagsChart/FlagsChart';
import { useExecutiveDashboard } from 'hooks/api/getters/useExecutiveSummary/useExecutiveSummary';
import { UserStats } from './UserStats/UserStats';
import { FlagStats } from './FlagStats/FlagStats';
import { Widget } from './Widget/Widget';
import { FlagsProjectChart } from './FlagsProjectChart/FlagsProjectChart';
import { ProjectHealthChart } from './ProjectHealthChart/ProjectHealthChart';
import { TimeToProductionChart } from './TimeToProductionChart/TimeToProductionChart';
import { TimeToProduction } from './TimeToProduction/TimeToProduction';
import {
    ProjectSelect,
    allOption,
} from '../common/ProjectSelect/ProjectSelect';
import { MetricsSummaryChart } from './MetricsSummaryChart/MetricsSummaryChart';
import {
    ExecutiveSummarySchemaMetricsSummaryTrendsItem,
    ExecutiveSummarySchemaProjectFlagTrendsItem,
} from 'openapi';
import { HealthStats } from './HealthStats/HealthStats';
import { DashboardHeader } from './DashboardHeader/DashboardHeader';

const StyledGrid = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: `300px 1fr`,
    gridAutoRows: 'auto',
    gap: theme.spacing(2),
}));

const StyledBox = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(4),
    marginTop: theme.spacing(4),
    [theme.breakpoints.down('lg')]: {
        width: '100%',
        marginLeft: 0,
    },
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
}));

const useDashboardGrid = () => {
    const theme = useTheme();
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('lg'));
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    if (isSmallScreen) {
        return {
            gridTemplateColumns: `1fr`,
            chartSpan: 1,
            userTrendsOrder: 3,
            flagStatsOrder: 2,
            largeChartSpan: 1,
        };
    }

    if (isMediumScreen) {
        return {
            gridTemplateColumns: `1fr 1fr`,
            chartSpan: 2,
            userTrendsOrder: 3,
            flagStatsOrder: 2,
            largeChartSpan: 2,
        };
    }

    return {
        gridTemplateColumns: `300px auto`,
        chartSpan: 1,
        userTrendsOrder: 2,
        flagStatsOrder: 3,
        largeChartSpan: 2,
    };
};

interface FilteredProjectData {
    filteredProjectFlagTrends: ExecutiveSummarySchemaProjectFlagTrendsItem[];
    filteredMetricsSummaryTrends: ExecutiveSummarySchemaMetricsSummaryTrendsItem[];
}

export const ExecutiveDashboard: VFC = () => {
    const { executiveDashboardData, loading, error } = useExecutiveDashboard();
    const [projects, setProjects] = useState([allOption.id]);

    const flagPerUsers = useMemo(() => {
        if (
            executiveDashboardData.users.total === 0 ||
            executiveDashboardData.flags.total === 0
        )
            return '0';

        return (
            executiveDashboardData.flags.total /
            executiveDashboardData.users.total
        ).toFixed(1);
    }, [executiveDashboardData]);

    const { filteredProjectFlagTrends, filteredMetricsSummaryTrends } =
        useMemo<FilteredProjectData>(() => {
            if (projects[0] === allOption.id) {
                return {
                    filteredProjectFlagTrends:
                        executiveDashboardData.projectFlagTrends,
                    filteredMetricsSummaryTrends:
                        executiveDashboardData.metricsSummaryTrends,
                };
            }

            const filteredProjectFlagTrends =
                executiveDashboardData.projectFlagTrends.filter((trend) =>
                    projects.includes(trend.project),
                ) as ExecutiveSummarySchemaProjectFlagTrendsItem[];

            const filteredImpressionsSummary =
                executiveDashboardData.metricsSummaryTrends.filter((summary) =>
                    projects.includes(summary.project),
                ) as ExecutiveSummarySchemaMetricsSummaryTrendsItem[];

            return {
                filteredProjectFlagTrends,
                filteredMetricsSummaryTrends: filteredImpressionsSummary,
            };
        }, [executiveDashboardData, projects]);

    const {
        gridTemplateColumns,
        chartSpan,
        userTrendsOrder,
        flagStatsOrder,
        largeChartSpan,
    } = useDashboardGrid();

    return (
        <>
            <Box sx={(theme) => ({ paddingBottom: theme.spacing(4) })}>
                <DashboardHeader />
            </Box>
            <StyledGrid sx={{ gridTemplateColumns }}>
                <Widget title='Total users' order={1}>
                    <UserStats
                        count={executiveDashboardData.users.total}
                        active={executiveDashboardData.users.active}
                        inactive={executiveDashboardData.users.inactive}
                    />
                </Widget>
                <Widget title='Users' order={userTrendsOrder} span={chartSpan}>
                    <UsersChart
                        userTrends={executiveDashboardData.userTrends}
                        isLoading={loading}
                    />
                </Widget>
                <Widget
                    title='Total flags'
                    tooltip='Total flags represent the total active flags (not archived) that currently exist across all projects of your application.'
                    order={flagStatsOrder}
                >
                    <FlagStats
                        count={executiveDashboardData.flags.total}
                        flagsPerUser={flagPerUsers}
                    />
                </Widget>
                <Widget title='Number of flags' order={4} span={chartSpan}>
                    <FlagsChart
                        flagTrends={executiveDashboardData.flagTrends}
                        isLoading={loading}
                    />
                </Widget>
            </StyledGrid>
            <StyledBox>
                <Typography variant='h2' component='span'>
                    Insights per project
                </Typography>
                <ProjectSelect
                    selectedProjects={projects}
                    onChange={setProjects}
                    dataTestId={'DASHBOARD_PROJECT_SELECT'}
                    sx={{ flex: 1, maxWidth: '360px' }}
                />
            </StyledBox>
            <StyledGrid>
                <Widget
                    title='Number of flags per project'
                    order={5}
                    span={largeChartSpan}
                >
                    <FlagsProjectChart
                        projectFlagTrends={filteredProjectFlagTrends}
                    />
                </Widget>
                <Widget title='Average health' order={6}>
                    <HealthStats
                        // FIXME: data from API
                        value={80}
                        healthy={4}
                        stale={1}
                        potentiallyStale={0}
                    />
                </Widget>
                <Widget title='Health per project' order={7} span={chartSpan}>
                    <ProjectHealthChart
                        projectFlagTrends={filteredProjectFlagTrends}
                    />
                </Widget>
                <Widget
                    title='Metrics over time per project'
                    order={8}
                    span={largeChartSpan}
                >
                    <MetricsSummaryChart
                        metricsSummaryTrends={filteredMetricsSummaryTrends}
                    />
                </Widget>

                <Widget title='Average time to production' order={9}>
                    <TimeToProduction
                        //FIXME: data from API
                        daysToProduction={5.2}
                    />
                </Widget>
                <Widget title='Time to production' order={10} span={chartSpan}>
                    <TimeToProductionChart
                        projectFlagTrends={filteredProjectFlagTrends}
                    />
                </Widget>
            </StyledGrid>
        </>
    );
};
