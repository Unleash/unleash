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
    if (theme.mode === 'dark') {
        return {
            olderThanWeek: '#5A5CAC',
            newThisWeek: '#698745',
        };
    }
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

    // todo: use data from the actual endpoint when we have something useful to return
    const projects = state[`${statePrefix}project`]?.values ?? [allOption.id];
    const { insights, loading } = useInsights();

    // @ts-expect-error (lifecycleMetrics): The schema hasn't been updated yet.
    const { lifecycleTrends } = insights;

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
                    return (
                        <ChartContainer key={stage}>
                            <Chart data={data} stage={stage} />
                        </ChartContainer>
                    );
                })}
            </ChartRow>
        </InsightsSection>
    );
};

const Chart: React.FC<{ stage: string; data: LifecycleTrend }> = ({
    stage,
    data,
}) => {
    const chartColors = useChartColors();
    const oldData = [
        data.categories.experimental.flagsOlderThanWeek,
        data.categories.release.flagsOlderThanWeek,
        data.categories.permanent.flagsOlderThanWeek,
    ];

    const total = {
        experimental:
            data.categories.experimental.flagsOlderThanWeek +
            data.categories.experimental.newFlagsThisWeek,
        release:
            data.categories.release.flagsOlderThanWeek +
            data.categories.release.newFlagsThisWeek,
        permanent:
            data.categories.permanent.flagsOlderThanWeek +
            data.categories.permanent.newFlagsThisWeek,
    };

    const ariaLabel = `Bar chart; the number of flags in the ${stage} stage, separated by flag type. Experimental: ${total.experimental}, Release: ${total.release}, Other: ${total.permanent}`;

    const ariaDescription = `Flag counts are further separated into flags that have entered the stage within the last week (new) and flags that have been in the stage for more than a week (old). Experimental flags: ${data.categories.experimental.flagsOlderThanWeek} old, ${data.categories.experimental.newFlagsThisWeek} new. Release flags: ${data.categories.release.flagsOlderThanWeek} old, ${data.categories.release.newFlagsThisWeek} new. Other flags: ${data.categories.permanent.flagsOlderThanWeek} old, ${data.categories.permanent.newFlagsThisWeek} new.`;

    return (
        <LifecycleChart
            ariaLabel={ariaLabel}
            ariaDescription={ariaDescription}
            data={{
                labels: [`Experimental`, `Release`, `Other flags`],
                datasets: [
                    {
                        label: 'Flags > 1 week old',
                        data: oldData,
                        stack: '1',
                        backgroundColor: chartColors.olderThanWeek,
                        borderRadius: 4,
                        datalabels: {
                            labels: {
                                value: {
                                    formatter: (value, context) => {
                                        // todo (lifecycleMetrics): use a nice
                                        // formatter here, so that 1,000,000
                                        // flags are instead formatted as 1M
                                        if (
                                            context.chart.legend
                                                ?.legendItems?.[1].hidden
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
                            data.categories.experimental.newFlagsThisWeek,
                            data.categories.release.newFlagsThisWeek,
                            data.categories.permanent.newFlagsThisWeek,
                        ],
                        stack: '1',
                        backgroundColor: chartColors.newThisWeek,
                        borderRadius: 4,
                        datalabels: {
                            labels: {
                                value: {
                                    formatter: (value, context) => {
                                        if (
                                            context.chart.legend
                                                ?.legendItems?.[0].hidden
                                        ) {
                                            return value;
                                        }
                                        return (
                                            value + oldData[context.dataIndex]
                                        );
                                    },
                                },
                            },
                        },
                    },
                ],
            }}
        />
    );
};

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
