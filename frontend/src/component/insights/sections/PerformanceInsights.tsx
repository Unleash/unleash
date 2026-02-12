import { allOption } from 'component/common/ProjectSelect/ProjectSelect';
import { format, subMonths } from 'date-fns';
import { useInsights } from 'hooks/api/getters/useInsights/useInsights';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { usePersistentTableState } from 'hooks/usePersistentTableState';
import type { FC } from 'react';
import { withDefault } from 'use-query-params';
import { FilterItemParam } from 'utils/serializeQueryParams';
import type { FilterItemParamHolder } from 'component/filter/Filters/Filters';
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
import { NewProductionFlagsChart } from '../componentsChart/NewProductionFlagsChart/NewProductionFlagsChart.tsx';
import { CreationArchiveChart } from '../componentsChart/CreationArchiveChart/CreationArchiveChart.tsx';
import { CreationArchiveStats } from '../componentsStat/CreationArchiveStats/CreationArchiveStats.tsx';
import { NewProductionFlagsStats } from '../componentsStat/NewProductionFlagsStats/NewProductionFlagsStats.tsx';
import { useProductionFlagsData } from '../componentsChart/NewProductionFlagsChart/useNewProductionFlagsData.ts';
import { autocorrectDateRange } from 'component/filter/autocorrectDateRange.ts';

const NewProductionFlagsWidget = ({
    groupedLifecycleData,
    loading,
    showAllProjects,
    labels,
}) => {
    const { median, chartData } = useProductionFlagsData({
        groupedLifecycleData,
        labels,
        loading,
        showAllProjects,
    });

    return (
        <StyledWidget>
            <StyledWidgetStats width={275}>
                <WidgetTitle title='New flags in production' />
                <NewProductionFlagsStats
                    chartData={chartData}
                    median={median}
                />
            </StyledWidgetStats>
            <StyledChartContainer>
                <NewProductionFlagsChart chartData={chartData} />
            </StyledChartContainer>
        </StyledWidget>
    );
};

export const PerformanceInsights: FC = () => {
    const statePrefix = 'performance-';
    const fromKey = `${statePrefix}from`;
    const toKey = `${statePrefix}to`;
    const stateConfig = {
        [`${statePrefix}project`]: FilterItemParam,
        [fromKey]: withDefault(FilterItemParam, {
            values: [format(subMonths(new Date(), 1), 'yyyy-MM-dd')],
            operator: 'IS',
        }),
        [toKey]: withDefault(FilterItemParam, {
            values: [format(new Date(), 'yyyy-MM-dd')],
            operator: 'IS',
        }),
    };
    const [state, setStateRaw] = usePersistentTableState(
        'insights',
        stateConfig,
        [fromKey, toKey],
    );

    const setState = (newState: FilterItemParamHolder) => {
        setStateRaw((oldState) =>
            autocorrectDateRange(oldState, newState, { fromKey, toKey }),
        );
    };

    const { insights, loading } = useInsights(
        state[fromKey]?.values[0],
        state[toKey]?.values[0],
    );

    const projects = state[`${statePrefix}project`]?.values ?? [allOption.id];

    const showAllProjects = projects[0] === allOption.id;
    const {
        flagTrends,
        summary,
        groupedProjectsData,
        groupedLifecycleData,
        groupedMetricsData,
        allMetricsDatapoints,
        environmentTypeTrends,
        groupedCreationArchiveData,
    } = useInsightsData(insights, projects);

    const { isEnterprise } = useUiConfig();
    const lastFlagTrend = flagTrends[flagTrends.length - 1];
    const flagsTotal = lastFlagTrend?.total ?? 0;

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
            {isEnterprise() ? (
                <NewProductionFlagsWidget
                    groupedLifecycleData={groupedLifecycleData}
                    loading={loading}
                    showAllProjects={showAllProjects}
                    labels={insights.labels}
                />
            ) : null}

            {isEnterprise() ? (
                <StyledWidget>
                    <StyledWidgetStats width={275}>
                        <WidgetTitle title='Flags archived vs flags created' />
                        <CreationArchiveStats
                            groupedCreationArchiveData={
                                groupedCreationArchiveData
                            }
                            isLoading={loading}
                        />
                    </StyledWidgetStats>
                    <StyledChartContainer>
                        <CreationArchiveChart
                            labels={insights.labels}
                            creationArchiveTrends={groupedCreationArchiveData}
                            isLoading={loading}
                        />
                    </StyledChartContainer>
                </StyledWidget>
            ) : null}

            {showAllProjects ? (
                <StyledWidget>
                    <StyledWidgetStats width={275}>
                        <WidgetTitle title='Flags' />
                        <FlagStats count={flagsTotal} isLoading={loading} />
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
                        <FlagStats count={summary.total} isLoading={loading} />
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
                            technicalDebt={summary.technicalDebt}
                            healthy={summary.active}
                            stale={summary.stale}
                            potentiallyStale={summary.potentiallyStale}
                            title={
                                <WidgetTitle
                                    title='Technical debt'
                                    tooltip={
                                        'Percentage of flags that are stale or potentially stale.'
                                    }
                                />
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
