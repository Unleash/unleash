import { usePersistentTableState } from 'hooks/usePersistentTableState';
import type { FC } from 'react';
import { FilterItemParam } from 'utils/serializeQueryParams';
import { InsightsSection } from 'component/insights/sections/InsightsSection';
import { InsightsFilters } from 'component/insights/InsightsFilters';
import { allOption } from 'component/common/ProjectSelect/ProjectSelect';
import { useInsights } from 'hooks/api/getters/useInsights/useInsights';
import { LifecycleChart } from '../components/LifecycleChart/LifecycleChart.tsx';
import { styled, useTheme } from '@mui/material';
import {
    prettifyLargeNumber,
    PrettifyLargeNumber,
} from 'component/common/PrettifyLargeNumber/PrettifyLargeNumber.tsx';
import { FeatureLifecycleStageIcon } from 'component/common/FeatureLifecycle/FeatureLifecycleStageIcon.tsx';
import { normalizeDays } from './normalize-days.ts';

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
    gap: theme.spacing(2),
    gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
}));

const LifecycleTile = styled('article')(({ theme }) => ({
    background: theme.palette.background.default,
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(3),
    minWidth: 0,
}));

const lifecycleStageMap = {
    develop: 'pre-live',
    production: 'live',
    cleanup: 'completed',
};

const TileHeader = styled('h3')(({ theme }) => ({
    margin: 0,
    fontSize: theme.typography.body1.fontSize,
    fontWeight: 'normal',
    padding: theme.spacing(1),
    marginBottom: theme.spacing(3),
}));

const HeaderNumber = styled('span')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    gap: theme.spacing(2),
    fontSize: theme.typography.h1.fontSize,
    fontWeight: 'bold',
}));

const Stats = styled('dl')(({ theme }) => ({
    background: theme.palette.background.elevation1,
    borderRadius: theme.shape.borderRadiusMedium,
    fontSize: theme.typography.body2.fontSize,
    '& dt::after': {
        content: '":"',
    },
    '& dd': {
        margin: 0,
        fontWeight: 'bold',
    },
    paddingInline: theme.spacing(2),
    paddingBlock: theme.spacing(1.5),
    gap: theme.spacing(1.5),
    margin: 0,
    marginTop: theme.spacing(2),
}));

const StatRow = styled('div')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row wrap',
    gap: theme.spacing(0.5),
    fontSize: theme.typography.body2.fontSize,
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
                        <LifecycleTile key={stage}>
                            <TileHeader>
                                <HeaderNumber>
                                    <PrettifyLargeNumber
                                        value={data.totalFlags ?? 0}
                                        threshold={1000}
                                        precision={1}
                                    />
                                    <FeatureLifecycleStageIcon
                                        aria-hidden='true'
                                        stage={{
                                            name: lifecycleStageMap[stage],
                                        }}
                                    />
                                </HeaderNumber>
                                <span>Flags in {stage} stage</span>
                            </TileHeader>
                            <div>
                                <Chart data={data} stage={stage} />
                            </div>
                            <Stats>
                                <StatRow>
                                    <dt>
                                        Median time for flags currently in stage
                                    </dt>
                                    <dd data-loading-project-lifecycle-summary>
                                        {normalizeDays(
                                            data.averageTimeInStageDays,
                                        )}
                                    </dd>
                                </StatRow>
                                <StatRow>
                                    <dt>
                                        Historical median time for flags in
                                        stage
                                    </dt>
                                    <dd data-loading-project-lifecycle-summary>
                                        {normalizeDays(
                                            data.averageTimeInStageDays,
                                        )}
                                    </dd>
                                </StatRow>
                            </Stats>
                        </LifecycleTile>
                    );
                })}
            </ChartRow>
        </InsightsSection>
    );
};

const prettifyFlagCount = prettifyLargeNumber(1000, 2);

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
                                            return prettifyFlagCount(value);
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
                                            return prettifyFlagCount(value);
                                        }
                                        return prettifyFlagCount(
                                            value + oldData[context.dataIndex],
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
