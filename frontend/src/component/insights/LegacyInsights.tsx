import type { FC } from 'react';
import { styled } from '@mui/material';
import { usePersistentTableState } from 'hooks/usePersistentTableState';
import { allOption } from 'component/common/ProjectSelect/ProjectSelect';
import { useInsights } from 'hooks/api/getters/useInsights/useInsights';
import { InsightsHeader } from './components/InsightsHeader/InsightsHeader.tsx';
import { useInsightsData } from './hooks/useInsightsData.ts';
import { Sticky } from 'component/common/Sticky/Sticky';
import { InsightsFilters } from './InsightsFilters.tsx';
import { FilterItemParam } from '../../utils/serializeQueryParams.ts';
import { format, subMonths } from 'date-fns';
import { withDefault } from 'use-query-params';
import { InsightsCharts } from './InsightsCharts.tsx';

const StyledWrapper = styled('div')(({ theme }) => ({
    paddingTop: theme.spacing(2),
}));

const StickyContainer = styled(Sticky)(({ theme }) => ({
    position: 'sticky',
    top: 0,
    zIndex: theme.zIndex.sticky,
    padding: theme.spacing(2, 0),
    background: theme.palette.background.application,
    transition: 'padding 0.3s ease',
}));

interface InsightsProps {
    withCharts?: boolean;
}

export const LegacyInsights: FC<InsightsProps> = ({ withCharts = true }) => {
    const stateConfig = {
        project: FilterItemParam,
        from: withDefault(FilterItemParam, {
            values: [format(subMonths(new Date(), 1), 'yyyy-MM-dd')],
            operator: 'IS',
        }),
        to: withDefault(FilterItemParam, {
            values: [format(new Date(), 'yyyy-MM-dd')],
            operator: 'IS',
        }),
    };
    const [state, setState] = usePersistentTableState('insights', stateConfig, [
        'from',
        'to',
    ]);

    const { insights, loading } = useInsights(
        state.from?.values[0],
        state.to?.values[0],
    );

    const projects = state.project?.values ?? [allOption.id];

    const insightsData = useInsightsData(insights, projects);

    return (
        <StyledWrapper>
            <StickyContainer>
                <InsightsHeader
                    actions={
                        <InsightsFilters state={state} onChange={setState} />
                    }
                />
            </StickyContainer>
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
