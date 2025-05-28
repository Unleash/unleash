import type { FC } from 'react';
import { styled } from '@mui/material';
import { usePersistentTableState } from 'hooks/usePersistentTableState';
import { allOption } from 'component/common/ProjectSelect/ProjectSelect';
import { useInsights } from 'hooks/api/getters/useInsights/useInsights';
import { InsightsHeader } from './components/InsightsHeader/InsightsHeader.tsx';
import { useInsightsData } from './hooks/useInsightsData.ts';
import { InsightsCharts } from './InsightsCharts.tsx';
import { FilterItemParam } from '../../utils/serializeQueryParams.ts';
import { withDefault } from 'use-query-params';
import { useUiFlag } from 'hooks/useUiFlag.ts';
import { LegacyInsights } from './LegacyInsights.tsx';
import { format, subMonths } from 'date-fns';

const StyledWrapper = styled('div')(({ theme }) => ({
    paddingTop: theme.spacing(2),
}));

interface InsightsProps {
    // todo (lifecycleMetrics): remove this arg? it's only used for testing
    withCharts?: boolean;
}

const NewInsights: FC<InsightsProps> = ({ withCharts = true }) => {
    const stateConfig = {
        performanceProject: FilterItemParam,
        performanceFrom: withDefault(FilterItemParam, {
            values: [format(subMonths(new Date(), 1), 'yyyy-MM-dd')],
            operator: 'IS',
        }),
        performanceTo: withDefault(FilterItemParam, {
            values: [format(new Date(), 'yyyy-MM-dd')],
            operator: 'IS',
        }),
        lifecycleProject: FilterItemParam,

        usersProject: FilterItemParam,
        usersFrom: withDefault(FilterItemParam, {
            values: [format(subMonths(new Date(), 1), 'yyyy-MM-dd')],
            operator: 'IS',
        }),
        usersTo: withDefault(FilterItemParam, {
            values: [format(new Date(), 'yyyy-MM-dd')],
            operator: 'IS',
        }),
    };
    const [state, setState] = usePersistentTableState(
        'insights:v2',
        stateConfig,
        ['performanceFrom', 'performanceTo', 'usersFrom', 'usersTo'],
    );

    const { insights, loading } = useInsights(
        state.performanceFrom?.values[0],
        state.performanceTo?.values[0],
    );

    const projects = state.performanceProject?.values ?? [allOption.id];

    const insightsData = useInsightsData(insights, projects);

    return (
        <StyledWrapper>
            <InsightsHeader />
            {withCharts && (
                <InsightsCharts
                    loading={loading}
                    projects={projects}
                    {...insightsData}
                />
            )}
        </StyledWrapper>
    );
};

export const Insights: FC<InsightsProps> = (props) => {
    const useNewInsights = useUiFlag('lifecycleMetrics');
    console.log('useNewInsights', useNewInsights);

    return useNewInsights ? (
        <NewInsights {...props} />
    ) : (
        <LegacyInsights {...props} />
    );
};
