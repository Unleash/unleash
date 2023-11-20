import React, { FC, useEffect } from 'react';
import useProject, {
    useProjectNameOrId,
} from 'hooks/api/getters/useProject/useProject';
import { Box, styled } from '@mui/material';
import { ProjectFeatureToggles } from './ProjectFeatureToggles/ProjectFeatureToggles';
import ProjectInfo from './ProjectInfo/ProjectInfo';
import { usePageTitle } from 'hooks/usePageTitle';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useLastViewedProject } from 'hooks/useLastViewedProject';
import { ProjectStats } from './ProjectStats/ProjectStats';
import { useUiFlag } from 'hooks/useUiFlag';
import {
    DEFAULT_PAGE_LIMIT,
    useFeatureSearch,
} from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import {
    ProjectTableState,
    PaginatedProjectFeatureToggles,
} from './ProjectFeatureToggles/PaginatedProjectFeatureToggles';

import { useTableState } from 'hooks/useTableState';

const refreshInterval = 15 * 1000;

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    [theme.breakpoints.down('md')]: {
        flexDirection: 'column',
    },
}));

const StyledProjectToggles = styled('div')(() => ({
    width: '100%',
    minWidth: 0,
}));

const StyledContentContainer = styled(Box)(() => ({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    minWidth: 0,
}));

const PaginatedProjectOverview: FC<{
    fullWidth?: boolean;
    storageKey?: string;
}> = ({ fullWidth, storageKey = 'project-overview' }) => {
    const projectId = useRequiredPathParam('projectId');
    const { project, loading: projectLoading } = useProject(projectId, {
        refreshInterval,
    });

    const [tableState, setTableState] = useTableState<ProjectTableState>(
        {},
        `${storageKey}-${projectId}`,
    );

    const page = parseInt(tableState.page || '1', 10);
    const pageSize = tableState?.pageSize
        ? parseInt(tableState.pageSize, 10) || DEFAULT_PAGE_LIMIT
        : DEFAULT_PAGE_LIMIT;

    const {
        features: searchFeatures,
        total,
        refetch,
        loading,
        initialLoad,
    } = useFeatureSearch(
        (page - 1) * pageSize,
        pageSize,
        {
            sortBy: tableState.sortBy || 'createdAt',
            sortOrder: tableState.sortOrder === 'desc' ? 'desc' : 'asc',
            favoritesFirst: tableState.favorites === 'true',
        },
        projectId,
        tableState.search,
        {
            refreshInterval,
        },
    );

    const { members, features, health, description, environments, stats } =
        project;

    return (
        <StyledContainer>
            <ProjectInfo
                id={projectId}
                description={description}
                memberCount={members}
                health={health}
                features={features}
                stats={stats}
            />
            <StyledContentContainer>
                <ProjectStats stats={project.stats} />
                <StyledProjectToggles>
                    <PaginatedProjectFeatureToggles
                        key={
                            (loading || projectLoading) &&
                            searchFeatures.length === 0
                                ? 'loading'
                                : 'ready'
                        }
                        style={
                            fullWidth ? { width: '100%', margin: 0 } : undefined
                        }
                        features={searchFeatures || []}
                        environments={environments}
                        initialLoad={initialLoad && searchFeatures.length === 0}
                        loading={loading && searchFeatures.length === 0}
                        onChange={refetch}
                        total={total}
                        tableState={tableState}
                        setTableState={setTableState}
                    />
                </StyledProjectToggles>
            </StyledContentContainer>
        </StyledContainer>
    );
};

/**
 * @deprecated remove when flag `featureSearchFrontend` is removed
 */
const ProjectOverview = () => {
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectNameOrId(projectId);
    const { project, loading, refetch } = useProject(projectId, {
        refreshInterval,
    });
    const { members, features, health, description, environments, stats } =
        project;
    usePageTitle(`Project overview – ${projectName}`);
    const { setLastViewed } = useLastViewedProject();
    const featureSearchFrontend = useUiFlag('featureSearchFrontend');

    useEffect(() => {
        setLastViewed(projectId);
    }, [projectId, setLastViewed]);

    if (featureSearchFrontend) return <PaginatedProjectOverview />;

    return (
        <StyledContainer>
            <ProjectInfo
                id={projectId}
                description={description}
                memberCount={members}
                health={health}
                features={features}
                stats={stats}
            />
            <StyledContentContainer>
                <ProjectStats stats={project.stats} />
                <StyledProjectToggles>
                    <ProjectFeatureToggles
                        key={loading ? 'loading' : 'ready'}
                        features={features}
                        environments={environments}
                        loading={loading}
                        onChange={refetch}
                    />
                </StyledProjectToggles>
            </StyledContentContainer>
        </StyledContainer>
    );
};

export default ProjectOverview;
