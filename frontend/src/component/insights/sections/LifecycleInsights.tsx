import { usePersistentTableState } from 'hooks/usePersistentTableState';
import type { FC } from 'react';
import { FilterItemParam } from 'utils/serializeQueryParams';
import { InsightsSection } from 'component/insights/sections/InsightsSection';
import { InsightsFilters } from 'component/insights/InsightsFilters';
import { allOption } from 'component/common/ProjectSelect/ProjectSelect';
import { useInsights } from 'hooks/api/getters/useInsights/useInsights';

export const LifecycleInsights: FC = () => {
    const statePrefix = 'lifecycle-';
    const stateConfig = {
        [`${statePrefix}project`]: FilterItemParam,
    };
    const [state, setState] = usePersistentTableState(
        'insights-lifecycle',
        stateConfig,
    );

    const projects = state[`${statePrefix}project`]?.values ?? [allOption.id];
    const { insights, loading } = useInsights();

    // @ts-expect-error (lifecycleMetrics): The schema hasn't been updated yet.
    const { lifecycleTrends } = insights;
    console.log('lifecycleTrends', lifecycleTrends);

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
            <pre>{JSON.stringify(lifecycleTrends, null, 2)}</pre>
        </InsightsSection>
    );
};
