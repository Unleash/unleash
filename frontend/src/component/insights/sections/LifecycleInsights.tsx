import { usePersistentTableState } from 'hooks/usePersistentTableState';
import type { FC } from 'react';
import { FilterItemParam } from 'utils/serializeQueryParams';
import { InsightsSection } from 'component/insights/sections/InsightsSection';
import { InsightsFilters } from 'component/insights/InsightsFilters';
import { allOption } from 'component/common/ProjectSelect/ProjectSelect';
import { useInsights } from 'hooks/api/getters/useInsights/useInsights';
import { LifecycleChart } from '../components/LifecycleChart/LifecycleChart.tsx';
import { styled, useTheme } from '@mui/material';

type LifecycleTrend = {
    totalFlags: number;
    averageTimeInStageDays: number;
    categories: {
        experimental: {
            flagsOlderThanWeek: number;
            newFlagsThisWeek: number;
        };
        release: {
            flagsOlderThanWeek: number;
            newFlagsThisWeek: number;
        };
        permanent: {
            flagsOlderThanWeek: number;
            newFlagsThisWeek: number;
        };
    };
};

type LifecycleInsights = {
    develop: LifecycleTrend;
    production: LifecycleTrend;
    cleanup: LifecycleTrend;
};

const useChartColors = () => {
    const theme = useTheme();
    return {
        olderThanWeek: theme.palette.primary.light,
        newThisWeek: theme.palette.success.border,
    };
};

const ChartRow = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: theme.spacing(2),
}));

const ChartContainer = styled('article')(({ theme }) => ({
    background: theme.palette.background.default,
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(2),
    minWidth: 0,
}));

export const LifecycleInsights: FC = () => {
    const statePrefix = 'lifecycle-';
    const stateConfig = {
        [`${statePrefix}project`]: FilterItemParam,
    };
    const [state, setState] = usePersistentTableState(
        'insights-lifecycle',
        stateConfig,
    );
    const chartColors = useChartColors();

    const projects = state[`${statePrefix}project`]?.values ?? [allOption.id];
    const { insights, loading } = useInsights();

    // @ts-expect-error (lifecycleMetrics): The schema hasn't been updated yet.
    const { lifecycleTrends } = insights;

    const mockData: LifecycleInsights = {
        develop: {
            totalFlags: 35,
            averageTimeInStageDays: 28,
            categories: {
                experimental: {
                    flagsOlderThanWeek: 11,
                    newFlagsThisWeek: 4,
                },
                release: {
                    flagsOlderThanWeek: 12,
                    newFlagsThisWeek: 1,
                },
                permanent: {
                    flagsOlderThanWeek: 7,
                    newFlagsThisWeek: 0,
                },
            },
        },
        production: {
            totalFlags: 10,
            averageTimeInStageDays: 14,
            categories: {
                experimental: {
                    flagsOlderThanWeek: 2,
                    newFlagsThisWeek: 3,
                },
                release: {
                    flagsOlderThanWeek: 1,
                    newFlagsThisWeek: 1,
                },
                permanent: {
                    flagsOlderThanWeek: 3,
                    newFlagsThisWeek: 0,
                },
            },
        },
        cleanup: {
            totalFlags: 5,
            averageTimeInStageDays: 16,
            categories: {
                experimental: {
                    flagsOlderThanWeek: 0,
                    newFlagsThisWeek: 3,
                },
                release: {
                    flagsOlderThanWeek: 0,
                    newFlagsThisWeek: 1,
                },
                permanent: {
                    flagsOlderThanWeek: 1,
                    newFlagsThisWeek: 0,
                },
            },
        },
    };

    return (
        <InsightsSection
            title='Flags lifecycle currently'
            filters={
                <InsightsFilters
                    state={state}
                    onChange={setState}
                    filterNamePrefix={statePrefix}
                />
            }
        >
            <ChartRow>
                {Object.entries(mockData).map(([stage, data]) => {
                    const oldData = [
                        data.categories.experimental.flagsOlderThanWeek,
                        data.categories.release.flagsOlderThanWeek,
                        data.categories.permanent.flagsOlderThanWeek,
                    ];
                    return (
                        <ChartContainer key={stage}>
                            <LifecycleChart
                                data={{
                                    labels: [
                                        `Experimental`,
                                        `Release`,
                                        `Other flags`,
                                    ],
                                    datasets: [
                                        {
                                            label: 'Flags > 1 week old',
                                            data: oldData,
                                            stack: '1',
                                            backgroundColor:
                                                chartColors.olderThanWeek,
                                            borderRadius: 4,
                                            datalabels: {
                                                labels: {
                                                    value: {
                                                        formatter: (
                                                            value,
                                                            context,
                                                        ) => {
                                                            // todo (lifecycleMetrics): use a nice formatter here, so that 1,000,000 flags are instead formatted as 1M
                                                            if (
                                                                context.chart
                                                                    .legend
                                                                    ?.legendItems?.[1]
                                                                    .hidden
                                                            ) {
                                                                return value;
                                                            }
                                                            return '';
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                        {
                                            label: 'New flags this week',
                                            data: [
                                                data.categories.experimental
                                                    .newFlagsThisWeek,
                                                data.categories.release
                                                    .newFlagsThisWeek,
                                                data.categories.permanent
                                                    .newFlagsThisWeek,
                                            ],
                                            stack: '1',
                                            backgroundColor:
                                                chartColors.newThisWeek,
                                            borderRadius: 4,
                                            datalabels: {
                                                labels: {
                                                    value: {
                                                        formatter: (
                                                            value,
                                                            context,
                                                        ) => {
                                                            if (
                                                                context.chart
                                                                    .legend
                                                                    ?.legendItems?.[0]
                                                                    .hidden
                                                            ) {
                                                                return value;
                                                            }
                                                            return (
                                                                value +
                                                                oldData[
                                                                    context
                                                                        .dataIndex
                                                                ]
                                                            );
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    ],
                                }}
                            />
                        </ChartContainer>
                    );
                })}
            </ChartRow>
        </InsightsSection>
    );
};
