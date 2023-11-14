import React, { useCallback, useEffect, useState } from 'react';
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
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import { PaginatedProjectFeatureToggles } from './ProjectFeatureToggles/PaginatedProjectFeatureToggles';
import { useSearchParams } from 'react-router-dom';

const refreshInterval = 15 * 1000;
const defaultPageSize = 25;

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

const PaginatedProjectOverview = () => {
    const projectId = useRequiredPathParam('projectId');
    const [searchParams, setSearchParams] = useSearchParams();
    const { project, loading: projectLoading } = useProject(projectId, {
        refreshInterval,
    });
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(defaultPageSize);
    const [searchValue, setSearchValue] = useState(
        searchParams.get('search') || '',
    );

    const {
        features: searchFeatures,
        total,
        refetch,
        loading,
        initialLoad,
    } = useFeatureSearch(pageIndex * pageSize, pageSize, projectId, searchValue, {
        refreshInterval,
    });

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
                            loading && searchFeatures.length === 0
                                ? 'loading'
                                : 'ready'
                        }
                        features={searchFeatures}
                        environments={environments}
                        initialLoad={initialLoad && searchFeatures.length === 0}
                        loading={loading && searchFeatures.length === 0}
                        onChange={refetch}
                        total={total}
                        searchValue={searchValue}
                        setSearchValue={setSearchValue}
                        setPageIndex={setPageIndex}
                        setPageSize={setPageSize}
                        initialPageIndex={pageIndex}
                        initialPageSize={pageSize}
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
