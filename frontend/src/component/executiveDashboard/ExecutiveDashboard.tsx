import { useMemo, useState, VFC } from 'react';
import {
    Box,
    styled,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
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
import { ProjectSelect, allOption } from './ProjectSelect/ProjectSelect';
import { ImpressionsSummaryChart } from './ImpressionsSummaryChart/ImpressionsSummaryChart';
import {
    ExecutiveSummarySchemaImpressionsSummaryItem,
    ExecutiveSummarySchemaProjectFlagTrendsItem,
} from '../../openapi';

const StyledGrid = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: `300px 1fr`,
    gridAutoRows: 'auto',
    gap: theme.spacing(2),
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
    filteredImpressionsSummary: ExecutiveSummarySchemaImpressionsSummaryItem[];
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

    const { filteredProjectFlagTrends, filteredImpressionsSummary } =
        useMemo<FilteredProjectData>(() => {
            if (projects[0] === allOption.id) {
                return {
                    filteredProjectFlagTrends:
                        executiveDashboardData.projectFlagTrends,
                    filteredImpressionsSummary:
                        executiveDashboardData.impressionsSummary,
                };
            }

            const filteredProjectFlagTrends =
                executiveDashboardData.projectFlagTrends.filter((trend) =>
                    projects.includes(trend.project),
                ) as ExecutiveSummarySchemaProjectFlagTrendsItem[];

            const filteredImpressionsSummary =
                executiveDashboardData.impressionsSummary.filter((summary) =>
                    projects.includes(summary.project),
                ) as ExecutiveSummarySchemaImpressionsSummaryItem[];

            return { filteredProjectFlagTrends, filteredImpressionsSummary };
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
                <PageHeader
                    titleElement={
                        <Typography variant='h1' component='span'>
                            Dashboard
                        </Typography>
                    }
                />
            </Box>
            <StyledGrid sx={{ gridTemplateColumns }}>
                <Widget title='Total users' order={1}>
                    <UserStats count={executiveDashboardData.users.total} />
                </Widget>
                <Widget title='Users' order={userTrendsOrder} span={chartSpan}>
                    <UsersChart
                        userTrends={executiveDashboardData.userTrends}
                        isLoading={loading}
                    />
                </Widget>
                <Widget
                    title='Total flags'
                    tooltip='Total flags represent the total ctive flags (not archived) that currently exist across all projects of your application.'
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
            <ProjectSelect selectedProjects={projects} onChange={setProjects} />
            <StyledGrid>
                <Widget
                    title='Imperssions over time per project'
                    order={5}
                    span={largeChartSpan}
                >
                    <ImpressionsSummaryChart
                        impressionsSummary={filteredImpressionsSummary}
                    />
                </Widget>
                <Widget
                    title='Number of flags per project'
                    order={5}
                    span={largeChartSpan}
                >
                    <FlagsProjectChart
                        projectFlagTrends={filteredProjectFlagTrends}
                    />
                </Widget>
                <Widget
                    title='Health per project'
                    order={6}
                    span={largeChartSpan}
                >
                    <ProjectHealthChart
                        projectFlagTrends={filteredProjectFlagTrends}
                    />
                </Widget>
                <Widget title='Average time to production' order={7}>
                    {/* FIXME: data from API */}
                    <TimeToProduction daysToProduction={12} />
                </Widget>
                <Widget title='Time to production' order={8} span={chartSpan}>
                    <TimeToProductionChart
                        projectFlagTrends={filteredProjectFlagTrends}
                    />
                </Widget>
            </StyledGrid>
        </>
    );
};
