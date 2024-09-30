import { useState, type FC } from 'react';
import { styled } from '@mui/material';
import { usePersistentTableState } from 'hooks/usePersistentTableState';
import { allOption } from 'component/common/ProjectSelect/ProjectSelect';
import { useInsights } from 'hooks/api/getters/useInsights/useInsights';
import { InsightsHeader } from './components/InsightsHeader/InsightsHeader';
import { useInsightsData } from './hooks/useInsightsData';
import { InsightsCharts } from './InsightsCharts';
import { Sticky } from 'component/common/Sticky/Sticky';
import { InsightsFilters } from './InsightsFilters';
import { FilterItemParam } from '../../utils/serializeQueryParams';

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

export const Insights: FC<InsightsProps> = ({ withCharts = true }) => {
    const [scrolled, setScrolled] = useState(false);

    const stateConfig = {
        project: FilterItemParam,
        from: FilterItemParam,
        to: FilterItemParam,
    };
    const [state, setState] = usePersistentTableState('insights', stateConfig);
    const { insights, loading } = useInsights(
        state.from?.values[0],
        state.to?.values[0],
    );

    const projects = state.project?.values ?? [allOption.id];

    const insightsData = useInsightsData(insights, projects);

    const handleScroll = () => {
        if (!scrolled && window.scrollY > 0) {
            setScrolled(true);
        } else if (scrolled && window.scrollY === 0) {
            setScrolled(false);
        }
    };

    if (typeof window !== 'undefined') {
        window.addEventListener('scroll', handleScroll);
    }

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
