import { useState, type VFC } from 'react';
import { Box, styled } from '@mui/material';
import { ArrayParam, withDefault } from 'use-query-params';
import { usePersistentTableState } from 'hooks/usePersistentTableState';
import {
    allOption,
    ProjectSelect,
} from 'component/common/ProjectSelect/ProjectSelect';
import { useInsights } from 'hooks/api/getters/useInsights/useInsights';
import { InsightsHeader } from './components/InsightsHeader/InsightsHeader';
import { useInsightsData } from './hooks/useInsightsData';
import { InsightsCharts } from './InsightsCharts';
import { LegacyInsightsCharts } from './LegacyInsightsCharts';
import { useUiFlag } from 'hooks/useUiFlag';
import { InsightsFilters } from './InsightsFilters';
import { FilterItemParam } from '../../utils/serializeQueryParams';

const StickyWrapper = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'scrolled',
})<{ scrolled?: boolean }>(({ theme, scrolled }) => ({
    position: 'sticky',
    top: 0,
    zIndex: theme.zIndex.sticky,
    padding: scrolled ? theme.spacing(2, 0) : theme.spacing(0, 0, 2),
    background: theme.palette.background.application,
    transition: 'padding 0.3s ease',
}));

const StyledProjectSelect = styled(ProjectSelect)(({ theme }) => ({
    flex: 1,
    width: '300px',
    [theme.breakpoints.down('sm')]: {
        width: '100%',
    },
}));

const LegacyInsights = () => {
    const [scrolled, setScrolled] = useState(false);
    const { insights, loading, error } = useInsights();
    const stateConfig = {
        projects: withDefault(ArrayParam, [allOption.id]),
    };
    const [state, setState] = usePersistentTableState('insights', stateConfig);
    const setProjects = (projects: string[]) => {
        setState({ projects });
    };
    const projects = state.projects
        ? (state.projects.filter(Boolean) as string[])
        : [];

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
        <>
            <StickyWrapper scrolled={scrolled}>
                <InsightsHeader
                    actions={
                        <StyledProjectSelect
                            selectedProjects={projects}
                            onChange={setProjects}
                            dataTestId={'DASHBOARD_PROJECT_SELECT'}
                            limitTags={1}
                        />
                    }
                />
            </StickyWrapper>
            <LegacyInsightsCharts
                loading={loading}
                projects={projects}
                {...insightsData}
            />
        </>
    );
};

const NewInsights = () => {
    const [scrolled, setScrolled] = useState(false);

    const stateConfig = {
        projects: FilterItemParam,
        from: FilterItemParam,
        to: FilterItemParam,
    };
    const [state, setState] = usePersistentTableState('insights', stateConfig);
    const { insights, loading, error } = useInsights(
        state.from?.values[0],
        state.to?.values[0],
    );

    const projects = state.projects?.values ?? [allOption.id];

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
        <>
            <StickyWrapper scrolled={scrolled}>
                <InsightsHeader
                    actions={
                        <InsightsFilters state={state} onChange={setState} />
                    }
                />
            </StickyWrapper>
            <InsightsCharts
                loading={loading}
                projects={projects}
                {...insightsData}
            />
        </>
    );
};

export const Insights: VFC = () => {
    const isInsightsV2Enabled = useUiFlag('insightsV2');
    if (isInsightsV2Enabled) return <NewInsights />;
    return <LegacyInsights />;
};
