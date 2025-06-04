import { allOption } from 'component/common/ProjectSelect/ProjectSelect';
import { format, subMonths } from 'date-fns';
import { useInsights } from 'hooks/api/getters/useInsights/useInsights';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { usePersistentTableState } from 'hooks/usePersistentTableState';
import type { FC } from 'react';
import { withDefault } from 'use-query-params';
import { FilterItemParam } from 'utils/serializeQueryParams';
import { WidgetTitle } from 'component/insights/components/WidgetTitle/WidgetTitle';
import { FlagsChart } from 'component/insights/componentsChart/FlagsChart/FlagsChart';
import { FlagsProjectChart } from 'component/insights/componentsChart/FlagsProjectChart/FlagsProjectChart';
import { MetricsSummaryChart } from 'component/insights/componentsChart/MetricsSummaryChart/MetricsSummaryChart';
import { ProjectHealthChart } from 'component/insights/componentsChart/ProjectHealthChart/ProjectHealthChart';
import { UpdatesPerEnvironmentTypeChart } from 'component/insights/componentsChart/UpdatesPerEnvironmentTypeChart/UpdatesPerEnvironmentTypeChart';
import { FlagStats } from 'component/insights/componentsStat/FlagStats/FlagStats';
import { HealthStats } from 'component/insights/componentsStat/HealthStats/HealthStats';
import { useInsightsData } from 'component/insights/hooks/useInsightsData';
import { InsightsSection } from 'component/insights/sections/InsightsSection';
import { InsightsFilters } from 'component/insights/InsightsFilters';
import {
    StyledChartContainer,
    StyledWidget,
    StyledWidgetContent,
    StyledWidgetStats,
} from '../InsightsCharts.styles';
import { useFlag } from '@unleash/proxy-client-react';

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

    const healthToTechDebtEnabled = useFlag('healthToTechDebt');

    const projects = state[`${statePrefix}project`]?.values ?? [allOption.id];

    const showAllProjects = projects[0] === allOption.id;
    const {
        flagTrends,
        summary,
        groupedProjectsData,
        userTrends,
        groupedMetricsData,
        allMetricsDatapoints,
        environmentTypeTrends,
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

    return (
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
            {showAllProjects ? (
                <StyledWidget>
                    <StyledWidgetStats width={275}>
                        <WidgetTitle title='Flags' />
                        <FlagStats
                            count={flagsTotal}
                            flagsPerUser={getFlagsPerUser(
                                flagsTotal,
                                usersTotal,
                            )}
                            isLoading={loading}
                        />
                    </StyledWidgetStats>
                    <StyledChartContainer>
                        <FlagsChart
                            flagTrends={flagTrends}
                            isLoading={loading}
                        />
                    </StyledChartContainer>
                </StyledWidget>
            ) : (
                <StyledWidget>
                    <StyledWidgetStats width={275}>
                        <WidgetTitle title='Flags' />
                        <FlagStats
                            count={summary.total}
                            flagsPerUser={''}
                            isLoading={loading}
                        />
                    </StyledWidgetStats>
                    <StyledChartContainer>
                        <FlagsProjectChart
                            projectFlagTrends={groupedProjectsData}
                            isLoading={loading}
                        />
                    </StyledChartContainer>
                </StyledWidget>
            )}
            {isEnterprise() ? (
                <StyledWidget>
                    <StyledWidgetStats width={350} padding={0}>
                        <HealthStats
                            value={summary.averageHealth}
                            healthy={summary.active}
                            stale={summary.stale}
                            potentiallyStale={summary.potentiallyStale}
                            title={
                                healthToTechDebtEnabled ? (
                                    <WidgetTitle
                                        title='Technical debt'
                                        tooltip={
                                            'Percentage of flags that are stale or potentially stale.'
                                        }
                                    />
                                ) : (
                                    <WidgetTitle
                                        title='Health'
                                        tooltip={
                                            'Percentage of flags that are not stale or potentially stale.'
                                        }
                                    />
                                )
                            }
                        />
                    </StyledWidgetStats>
                    <StyledChartContainer>
                        <ProjectHealthChart
                            projectFlagTrends={groupedProjectsData}
                            isAggregate={showAllProjects}
                            isLoading={loading}
                        />
                    </StyledChartContainer>
                </StyledWidget>
            ) : null}
            {isEnterprise() ? (
                <>
                    <StyledWidget>
                        <StyledWidgetContent>
                            <WidgetTitle
                                title='Flag evaluation metrics'
                                tooltip='Summary of all flag evaluations reported by SDKs.'
                            />
                            <StyledChartContainer>
                                <MetricsSummaryChart
                                    metricsSummaryTrends={groupedMetricsData}
                                    allDatapointsSorted={allMetricsDatapoints}
                                    isAggregate={showAllProjects}
                                    isLoading={loading}
                                />
                            </StyledChartContainer>
                        </StyledWidgetContent>
                    </StyledWidget>
                    <StyledWidget>
                        <StyledWidgetContent>
                            <WidgetTitle
                                title='Updates per environment type'
                                tooltip='Summary of all configuration updates per environment type.'
                            />
                            <UpdatesPerEnvironmentTypeChart
                                environmentTypeTrends={environmentTypeTrends}
                                isLoading={loading}
                            />
                        </StyledWidgetContent>
                    </StyledWidget>
                </>
            ) : null}
        </InsightsSection>
    );
};
