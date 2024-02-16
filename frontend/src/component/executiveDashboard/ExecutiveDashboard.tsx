import { ComponentProps, useEffect, useMemo, useState, VFC } from 'react';
import {
    Autocomplete,
    Box,
    styled,
    TextField,
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
import useProjects from '../../hooks/api/getters/useProjects/useProjects';
import { renderOption } from '../playground/Playground/PlaygroundForm/renderOption';

const StyledGrid = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: `300px 1fr`,
    gridAutoRows: 'auto',
    gap: theme.spacing(2),
}));

const StyledBox = styled(Box)(({ theme }) => ({
    width: '25%',
    marginLeft: '75%',
    marginBottom: theme.spacing(4),
    marginTop: theme.spacing(4),
    [theme.breakpoints.down('lg')]: {
        width: '100%',
        marginLeft: 0,
    },
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

interface IOption {
    label: string;
    id: string;
}

const allOption = { label: 'ALL', id: '*' };

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

    const filteredProjectFlagTrends = useMemo(() => {
        if (projects[0] === allOption.id) {
            return executiveDashboardData.projectFlagTrends;
        }

        return executiveDashboardData.projectFlagTrends.filter((trend) =>
            projects.includes(trend.project),
        );
    }, [executiveDashboardData, projects]);

    const {
        gridTemplateColumns,
        chartSpan,
        userTrendsOrder,
        flagStatsOrder,
        largeChartSpan,
    } = useDashboardGrid();

    const { projects: availableProjects } = useProjects();
    const projectsOptions = [
        allOption,
        ...availableProjects.map(({ name: label, id }) => ({
            label,
            id,
        })),
    ];

    const onProjectsChange: ComponentProps<typeof Autocomplete>['onChange'] = (
        event,
        value,
        reason,
    ) => {
        const newProjects = value as IOption | IOption[];
        if (reason === 'clear' || newProjects === null) {
            return setProjects([allOption.id]);
        }
        if (Array.isArray(newProjects)) {
            if (newProjects.length === 0) {
                return setProjects([allOption.id]);
            }
            if (
                newProjects.find(({ id }) => id === allOption.id) !== undefined
            ) {
                return setProjects([allOption.id]);
            }
            return setProjects(newProjects.map(({ id }) => id));
        }
        if (newProjects.id === allOption.id) {
            return setProjects([allOption.id]);
        }

        return setProjects([newProjects.id]);
    };

    const isAllProjects =
        projects &&
        (projects.length === 0 ||
            (projects.length === 1 && projects[0] === '*'));

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
            <StyledBox>
                <Autocomplete
                    disablePortal
                    id='projects'
                    limitTags={3}
                    multiple={!isAllProjects}
                    options={projectsOptions}
                    sx={{ flex: 1 }}
                    renderInput={(params) => (
                        <TextField {...params} label='Projects' />
                    )}
                    renderOption={renderOption}
                    getOptionLabel={({ label }) => label}
                    disableCloseOnSelect
                    size='small'
                    value={
                        isAllProjects
                            ? allOption
                            : projectsOptions.filter(({ id }) =>
                                  projects.includes(id),
                              )
                    }
                    onChange={onProjectsChange}
                    data-testid={'PLAYGROUND_PROJECT_SELECT'}
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
