import { allOption } from 'component/common/ProjectSelect/ProjectSelect';
import { format, subMonths } from 'date-fns';
import { useInsights } from 'hooks/api/getters/useInsights/useInsights';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { usePersistentTableState } from 'hooks/usePersistentTableState';
import type { FC } from 'react';
import { withDefault } from 'use-query-params';
import { FilterItemParam } from 'utils/serializeQueryParams';
import { FlagsChart } from 'component/insights/componentsChart/FlagsChart/FlagsChart';
import { FlagsProjectChart } from 'component/insights/componentsChart/FlagsProjectChart/FlagsProjectChart';
import { MetricsSummaryChart } from 'component/insights/componentsChart/MetricsSummaryChart/MetricsSummaryChart';
import { ProjectHealthChart } from 'component/insights/componentsChart/ProjectHealthChart/ProjectHealthChart';
import { UpdatesPerEnvironmentTypeChart } from 'component/insights/componentsChart/UpdatesPerEnvironmentTypeChart/UpdatesPerEnvironmentTypeChart';
import { useInsightsData } from 'component/insights/hooks/useInsightsData';
import { InsightsSection } from 'component/insights/sections/InsightsSection';
import { InsightsFilters } from 'component/insights/InsightsFilters';
import { Box, Typography, GlobalStyles, Tooltip, Link } from '@mui/material';
import { useUiFlag } from 'hooks/useUiFlag';
import { NewProductionFlagsChart } from '../componentsChart/NewProductionFlagsChart/NewProductionFlagsChart.tsx';
import { CreationArchiveChart } from '../componentsChart/CreationArchiveChart/CreationArchiveChart.tsx';

export const PerformanceInsights: FC = () => {
    const statePrefix = 'performance-';
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
    const [state, setState] = usePersistentTableState('insights', stateConfig, [
        'performance-from',
        'performance-to',
    ]);

    const { insights, loading } = useInsights(
        state[`${statePrefix}from`]?.values[0],
        state[`${statePrefix}to`]?.values[0],
    );

    const projects = state[`${statePrefix}project`]?.values ?? [allOption.id];

    const showAllProjects = projects[0] === allOption.id;
    const {
        flagTrends,
        summary,
        groupedProjectsData,
        groupedLifecycleData,
        userTrends,
        groupedMetricsData,
        allMetricsDatapoints,
        environmentTypeTrends,
        groupedCreationArchiveData,
    } = useInsightsData(insights, projects);

    const { isEnterprise } = useUiConfig();
    const lastUserTrend = userTrends[userTrends.length - 1];
    const usersTotal = lastUserTrend?.total ?? 0;
    const lastFlagTrend = flagTrends[flagTrends.length - 1];
    const flagsTotal = lastFlagTrend?.total ?? 0;

    function getFlagsPerUser(flagsTotal: number, usersTotal: number) {
        const flagsPerUserCalculation = flagsTotal / usersTotal;
        return Number.isNaN(flagsPerUserCalculation)
            ? 'N/A'
            : flagsPerUserCalculation.toFixed(2);
    }

    const isLifecycleGraphsEnabled = useUiFlag('lifecycleGraphs');

    function getCurrentArchiveRatio() {
        if (!groupedCreationArchiveData || Object.keys(groupedCreationArchiveData).length === 0) {
            return 0;
        }

        let totalArchived = 0;
        let totalCreated = 0;

        Object.values(groupedCreationArchiveData).forEach((projectData) => {
            const latestData = projectData[projectData.length - 1];
            if (latestData) {
                totalArchived += latestData.archivedFlags || 0;
                const createdSum = latestData.createdFlags
                    ? Object.values(latestData.createdFlags).reduce(
                          (sum: number, count: number) => sum + count,
                          0,
                      )
                    : 0;
                totalCreated += createdSum;
            }
        });

        return totalCreated > 0
            ? Math.round((totalArchived / totalCreated) * 100)
            : 0;
    }

    const currentRatio = getCurrentArchiveRatio();

    return (
        <>
        <GlobalStyles styles={{
            '@keyframes pulse': {
                '0%': {
                    boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.7)',
                },
                '70%': {
                    boxShadow: '0 0 0 6px rgba(16, 185, 129, 0)',
                },
                '100%': {
                    boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)',
                },
            }
        }} />
        <InsightsSection
            title='Performance insights'
            filters={
                <InsightsFilters
                    state={state}
                    onChange={setState}
                    filterNamePrefix={statePrefix}
                />
            }
        >
            <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { 
                    xs: '1fr', 
                    md: 'repeat(2, 1fr)' 
                }, 
                gap: 2,
                '& > *': {
                    minWidth: 0,
                }
            }}>
            {isLifecycleGraphsEnabled && isEnterprise() ? (
                <Box sx={{ 
                    borderRadius: 3,
                    overflow: 'hidden',
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                        transform: 'translateY(-4px)',
                    }
                }}>
                    <Box sx={{ 
                        p: 2, 
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        background: (theme) => theme.palette.mode === 'light' 
                            ? 'linear-gradient(to right, #f8f9fa, #ffffff)'
                            : theme.palette.background.default
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: '#10b981',
                                animation: 'pulse 2s infinite'
                            }} />
                            <Typography variant='body1' sx={{ fontWeight: 600, letterSpacing: '-0.01em' }}>
                                Production Deployments
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ p: 3 }}>
                        <NewProductionFlagsChart
                            lifecycleTrends={groupedLifecycleData}
                            isAggregate={showAllProjects}
                            isLoading={loading}
                        />
                    </Box>
                </Box>
            ) : null}

            {isLifecycleGraphsEnabled && isEnterprise() ? (
                <Box sx={{ 
                    borderRadius: 3,
                    overflow: 'hidden',
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                        transform: 'translateY(-4px)',
                    }
                }}>
                    <Box sx={{ 
                        p: 2, 
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        background: (theme) => theme.palette.mode === 'light' 
                            ? 'linear-gradient(to right, #f8f9fa, #ffffff)'
                            : theme.palette.background.default
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: '#8b5cf6',
                                }}/>
                                <Typography variant='body1' sx={{ fontWeight: 600, letterSpacing: '-0.01em' }}>
                                    Lifecycle Balance
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Tooltip title="Current ratio of archived flags to created flags" placement="top">
                                    <Typography 
                                        variant='body2' 
                                        sx={{ 
                                            color: 'primary.main',
                                            fontWeight: 600,
                                            cursor: 'help'
                                        }}
                                    >
                                        {loading ? '...' : `${currentRatio}%`}
                                    </Typography>
                                </Tooltip>
                                <Link 
                                    href='/search?lifecycle=IS:completed' 
                                    sx={{ 
                                        color: 'primary.main',
                                        textDecoration: 'none',
                                        fontSize: '0.875rem',
                                        '&:hover': {
                                            textDecoration: 'underline'
                                        }
                                    }}
                                >
                                    View cleanup
                                </Link>
                            </Box>
                        </Box>
                    </Box>
                    <Box sx={{ p: 3 }}>
                        <CreationArchiveChart
                            creationArchiveTrends={groupedCreationArchiveData}
                            isLoading={loading}
                        />
                    </Box>
                </Box>
            ) : null}

            {showAllProjects ? (
                <Box sx={{ 
                    borderRadius: 3,
                    overflow: 'hidden',
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                        transform: 'translateY(-4px)',
                    }
                }}>
                    <Box sx={{ 
                        p: 2, 
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        background: (theme) => theme.palette.mode === 'light' 
                            ? 'linear-gradient(to right, #f8f9fa, #ffffff)'
                            : theme.palette.background.default
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: '#3b82f6',
                                }}/>
                                <Typography variant='body1' sx={{ fontWeight: 600, letterSpacing: '-0.01em' }}>
                                    Flags
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Tooltip title={`Total: ${flagsTotal} flags, ${getFlagsPerUser(flagsTotal, usersTotal)} per user`} placement="top">
                                    <Typography 
                                        variant='body2' 
                                        sx={{ 
                                            color: 'primary.main',
                                            fontWeight: 600,
                                            cursor: 'help'
                                        }}
                                    >
                                        {loading ? '...' : flagsTotal}
                                    </Typography>
                                </Tooltip>
                            </Box>
                        </Box>
                    </Box>
                    <Box sx={{ p: 3 }}>
                        <FlagsChart
                            flagTrends={flagTrends}
                            isLoading={loading}
                        />
                    </Box>
                </Box>
            ) : (
                <Box sx={{ 
                    borderRadius: 3,
                    overflow: 'hidden',
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                        transform: 'translateY(-4px)',
                    }
                }}>
                    <Box sx={{ 
                        p: 2, 
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        background: (theme) => theme.palette.mode === 'light' 
                            ? 'linear-gradient(to right, #f8f9fa, #ffffff)'
                            : theme.palette.background.default
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: '#3b82f6',
                                }}/>
                                <Typography variant='body1' sx={{ fontWeight: 600, letterSpacing: '-0.01em' }}>
                                    Flags
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Tooltip title={`Total: ${summary.total} flags in selected projects`} placement="top">
                                    <Typography 
                                        variant='body2' 
                                        sx={{ 
                                            color: 'primary.main',
                                            fontWeight: 600,
                                            cursor: 'help'
                                        }}
                                    >
                                        {loading ? '...' : summary.total}
                                    </Typography>
                                </Tooltip>
                            </Box>
                        </Box>
                    </Box>
                    <Box sx={{ p: 3 }}>
                        <FlagsProjectChart
                            projectFlagTrends={groupedProjectsData}
                            isLoading={loading}
                        />
                    </Box>
                </Box>
            )}
            {isEnterprise() ? (
                <Box sx={{ 
                    borderRadius: 3,
                    overflow: 'hidden',
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                        transform: 'translateY(-4px)',
                    }
                }}>
                    <Box sx={{ 
                        p: 2, 
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        background: (theme) => theme.palette.mode === 'light' 
                            ? 'linear-gradient(to right, #f8f9fa, #ffffff)'
                            : theme.palette.background.default
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: '#ef4444',
                                }}/>
                                <Typography variant='body1' sx={{ fontWeight: 600, letterSpacing: '-0.01em' }}>
                                    Technical Debt
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Tooltip title={`${summary.technicalDebt}% of flags are stale or potentially stale. Healthy: ${summary.active}, Stale: ${summary.stale}, Potentially stale: ${summary.potentiallyStale}`} placement="top">
                                    <Typography 
                                        variant='body2' 
                                        sx={{ 
                                            color: summary.technicalDebt > 50 ? 'error.main' : 'primary.main',
                                            fontWeight: 600,
                                            cursor: 'help'
                                        }}
                                    >
                                        {loading ? '...' : `${summary.technicalDebt}%`}
                                    </Typography>
                                </Tooltip>
                                <Link 
                                    href='https://docs.getunleash.io/reference/insights#health' 
                                    target="_blank"
                                    sx={{ 
                                        color: 'primary.main',
                                        textDecoration: 'none',
                                        fontSize: '0.875rem',
                                        '&:hover': {
                                            textDecoration: 'underline'
                                        }
                                    }}
                                >
                                    Learn more
                                </Link>
                            </Box>
                        </Box>
                    </Box>
                    <Box sx={{ p: 3 }}>
                        <ProjectHealthChart
                            projectFlagTrends={groupedProjectsData}
                            isAggregate={showAllProjects}
                            isLoading={loading}
                        />
                    </Box>
                </Box>
            ) : null}
            {isEnterprise() ? (
                <Box sx={{ 
                    borderRadius: 3,
                    overflow: 'hidden',
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                        transform: 'translateY(-4px)',
                    }
                }}>
                    <Box sx={{ 
                        p: 2, 
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        background: (theme) => theme.palette.mode === 'light' 
                            ? 'linear-gradient(to right, #f8f9fa, #ffffff)'
                            : theme.palette.background.default
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: '#f59e0b',
                                }}/>
                                <Typography variant='body1' sx={{ fontWeight: 600, letterSpacing: '-0.01em' }}>
                                    Flag Evaluation Metrics
                                </Typography>
                            </Box>
                            <Tooltip title="Summary of all flag evaluations reported by SDKs" placement="top">
                                <Box sx={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    backgroundColor: 'action.hover',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'help'
                                }}>
                                    <Typography variant='caption' sx={{ fontWeight: 600 }}>?</Typography>
                                </Box>
                            </Tooltip>
                        </Box>
                    </Box>
                    <Box sx={{ p: 3 }}>
                        <MetricsSummaryChart
                            metricsSummaryTrends={groupedMetricsData}
                            allDatapointsSorted={allMetricsDatapoints}
                            isAggregate={showAllProjects}
                            isLoading={loading}
                        />
                    </Box>
                </Box>
            ) : null}
            {isEnterprise() ? (
                <Box sx={{ 
                    borderRadius: 3,
                    overflow: 'hidden',
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                        transform: 'translateY(-4px)',
                    }
                }}>
                    <Box sx={{ 
                        p: 2, 
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        background: (theme) => theme.palette.mode === 'light' 
                            ? 'linear-gradient(to right, #f8f9fa, #ffffff)'
                            : theme.palette.background.default
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: '#06b6d4',
                                }}/>
                                <Typography variant='body1' sx={{ fontWeight: 600, letterSpacing: '-0.01em' }}>
                                    Updates per Environment Type
                                </Typography>
                            </Box>
                            <Tooltip title="Summary of all configuration updates per environment type" placement="top">
                                <Box sx={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    backgroundColor: 'action.hover',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'help'
                                }}>
                                    <Typography variant='caption' sx={{ fontWeight: 600 }}>?</Typography>
                                </Box>
                            </Tooltip>
                        </Box>
                    </Box>
                    <Box sx={{ p: 3 }}>
                        <UpdatesPerEnvironmentTypeChart
                            environmentTypeTrends={environmentTypeTrends}
                            isLoading={loading}
                        />
                    </Box>
                </Box>
            ) : null}
            </Box>
        </InsightsSection>
        </>
    );
};
