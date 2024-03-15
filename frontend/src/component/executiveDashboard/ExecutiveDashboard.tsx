import { useState, VFC } from 'react';
import { Box, styled } from '@mui/material';
import { ArrayParam, withDefault } from 'use-query-params';
import { usePersistentTableState } from 'hooks/usePersistentTableState';
import {
    allOption,
    ProjectSelect,
} from 'component/common/ProjectSelect/ProjectSelect';
import { useExecutiveDashboard } from 'hooks/api/getters/useExecutiveSummary/useExecutiveSummary';
import { DashboardHeader } from './components/DashboardHeader/DashboardHeader';
import { useDashboardData } from './hooks/useDashboardData';
import { Charts } from './Charts';

const StickyWrapper = styled(Box)<{ scrolled?: boolean }>(
    ({ theme, scrolled }) => ({
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        padding: scrolled ? theme.spacing(2, 0) : theme.spacing(0, 0, 2),
        background: theme.palette.background.application,
        transition: 'padding 0.3s ease',
    }),
);

export const ExecutiveDashboard: VFC = () => {
    const [scrolled, setScrolled] = useState(false);
    const { executiveDashboardData, loading, error } = useExecutiveDashboard();
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

    const dashboardData = useDashboardData(executiveDashboardData, projects);

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
                <DashboardHeader
                    actions={
                        <ProjectSelect
                            selectedProjects={projects}
                            onChange={setProjects}
                            dataTestId={'DASHBOARD_PROJECT_SELECT'}
                            sx={{ flex: 1, maxWidth: '360px', width: '100%' }}
                        />
                    }
                />
            </StickyWrapper>
            <Charts loading={loading} projects={projects} {...dashboardData} />
        </>
    );
};
