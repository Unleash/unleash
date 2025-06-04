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
    aspectRatio: '5/4', // todo: temp
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
    console.log('lifecycleTrends', lifecycleTrends);

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

    // const f = (
    //     input: LifecycleTrend,
    // ): { labels: string[]; datasets: { data: number[] }[] } => {
    //     const flat = Object.entries(input.categories).map(([key, value]) => ({
    //         label: key,
    //         data: [value.flagsOlderThanWeek, value.newFlagsThisWeek],
    //     }));
    //     const result = Object.entries(input.categories).reduce(
    //         (acc, [key, value]) => {
    //             return {
    //                 ...acc,
    //                 labels: [...acc.labels, key],
    //                 datasets: [
    //                     ...acc.datasets,
    //                     {
    //                         data: [
    //                             value.flagsOlderThanWeek,
    //                             value.newFlagsThisWeek,
    //                         ],
    //                     },
    //                 ],
    //             };
    //         },
    //         { labels: [], datasets: [] },
    //     );
    //     return result;
    // };

    // console.log(mockData.develop, f(mockData.develop));

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
                {/* <pre>{JSON.stringify(lifecycleTrends, null, 2)}</pre> */}
                {Object.entries(mockData).map(([stage, data]) => (
                    <ChartContainer>
                        <LifecycleChart
                            key={stage}
                            data={{
                                labels: [
                                    `Experimental`,
                                    `Release`,
                                    `Other flags`,
                                ],
                                datasets: [
                                    {
                                        label: '> 1 week old',
                                        data: [
                                            data.categories.experimental
                                                .flagsOlderThanWeek,
                                            data.categories.release
                                                .flagsOlderThanWeek,
                                            data.categories.permanent
                                                .flagsOlderThanWeek,
                                        ],
                                        stack: '1',
                                        backgroundColor:
                                            chartColors.olderThanWeek,
                                    },
                                    {
                                        label: 'New this week',
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
                                    },
                                ],
                            }}
                        />
                    </ChartContainer>
                ))}
            </ChartRow>
        </InsightsSection>
    );
};
