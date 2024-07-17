import { useState, type FC } from 'react';
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
import { type IChartsProps, InsightsCharts } from './InsightsCharts';
import { LegacyInsightsCharts } from './LegacyInsightsCharts';
import { useUiFlag } from 'hooks/useUiFlag';
import { Sticky } from 'component/common/Sticky/Sticky';
import { InsightsFilters } from './InsightsFilters';
import { FilterItemParam } from '../../utils/serializeQueryParams';

const StyledWrapper = styled('div')(({ theme }) => ({
    paddingTop: theme.spacing(1),
}));

const StickyContainer = styled(Sticky)(({ theme }) => ({
    position: 'sticky',
    top: 0,
    zIndex: theme.zIndex.sticky,
    padding: theme.spacing(2, 0),
    background: theme.palette.background.application,
    transition: 'padding 0.3s ease',
}));

/**
 * @deprecated remove with insightsV2 flag
 */
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

/**
 * @deprecated remove with insightsV2 flag
 */
const LegacyInsights: FC = () => {
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
        <StyledWrapper>
            <StickyContainer>
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
            </StickyContainer>
            <LegacyInsightsCharts
                loading={loading}
                projects={projects}
                {...insightsData}
            />
        </StyledWrapper>
    );
};

interface InsightsProps {
    ChartComponent?: FC<IChartsProps>;
}

export const NewInsights: FC<InsightsProps> = ({ ChartComponent }) => {
    const [scrolled, setScrolled] = useState(false);

    const stateConfig = {
        project: FilterItemParam,
        from: FilterItemParam,
        to: FilterItemParam,
    };
    const [state, setState] = usePersistentTableState('insights', stateConfig);
    const { insights, loading, error } = useInsights(
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
            {ChartComponent && (
                <ChartComponent
                    loading={loading}
                    projects={projects}
                    {...insightsData}
                />
            )}
        </StyledWrapper>
    );
};

export const Insights: FC = () => {
    const isInsightsV2Enabled = useUiFlag('insightsV2');

    if (isInsightsV2Enabled)
        return <NewInsights ChartComponent={InsightsCharts} />;

    return <LegacyInsights />;
};
