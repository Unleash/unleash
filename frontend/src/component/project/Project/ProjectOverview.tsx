import React, { useEffect, useState } from 'react';
import useProject, {
    useProjectNameOrId,
} from 'hooks/api/getters/useProject/useProject';
import { Box, styled } from '@mui/material';
import { ProjectFeatureToggles as LegacyProjectFeatureToggles } from './ProjectFeatureToggles/LegacyProjectFeatureToggles';
import { ProjectFeatureToggles } from './ProjectFeatureToggles/ProjectFeatureToggles';
import ProjectInfo from './ProjectInfo/ProjectInfo';
import { usePageTitle } from 'hooks/usePageTitle';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useLastViewedProject } from 'hooks/useLastViewedProject';
import { ProjectStats } from './ProjectStats/ProjectStats';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useUiFlag } from 'hooks/useUiFlag';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import { PaginatedProjectFeatureToggles } from './ProjectFeatureToggles/PaginatedProjectFeatureToggles';
import { useSearchParams } from 'react-router-dom';

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

const PAGE_LIMIT = 25;

const PaginatedProjectOverview = () => {
    const projectId = useRequiredPathParam('projectId');
    const [searchParams, setSearchParams] = useSearchParams();
    const { project, loading: projectLoading } = useProject(projectId, {
        refreshInterval,
    });
    const [currentOffset, setCurrentOffset] = useState(0);

    const [searchValue, setSearchValue] = useState(
        searchParams.get('search') || '',
    );

    const {
        features: searchFeatures,
        total,
        refetch,
        loading,
    } = useFeatureSearch(currentOffset, PAGE_LIMIT, projectId, searchValue, {
        refreshInterval,
    });

    const { members, features, health, description, environments, stats } =
        project;
    const fetchNextPage = () => {
        if (!loading) {
            setCurrentOffset(Math.min(total, currentOffset + PAGE_LIMIT));
        }
    };
    const fetchPrevPage = () => {
        setCurrentOffset(Math.max(0, currentOffset - PAGE_LIMIT));
    };

    const hasPreviousPage = currentOffset > 0;
    const hasNextPage = currentOffset + PAGE_LIMIT < total;

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
                        loading={loading && searchFeatures.length === 0}
                        onChange={refetch}
                        total={total}
                        searchValue={searchValue}
                        setSearchValue={setSearchValue}
                    />
                    <ConditionallyRender
                        condition={hasPreviousPage}
                        show={<Box onClick={fetchPrevPage}>Prev</Box>}
                    />
                    <ConditionallyRender
                        condition={hasNextPage}
                        show={<Box onClick={fetchNextPage}>Next</Box>}
                    />
                </StyledProjectToggles>
            </StyledContentContainer>
        </StyledContainer>
    );
};

/**
 * @deprecated remove when flag `true` is removed
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
    const featureSwitchRefactor = useUiFlag('featureSwitchRefactor');
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
                    <ConditionallyRender
                        condition={Boolean(featureSwitchRefactor)}
                        show={() => (
                            <ProjectFeatureToggles
                                key={loading ? 'loading' : 'ready'}
                                features={features}
                                environments={environments}
                                loading={loading}
                                onChange={refetch}
                            />
                        )}
                        elseShow={() => (
                            <LegacyProjectFeatureToggles
                                key={loading ? 'loading' : 'ready'}
                                features={features}
                                environments={environments}
                                loading={loading}
                            />
                        )}
                    />
                </StyledProjectToggles>
            </StyledContentContainer>
        </StyledContainer>
    );
};

export default ProjectOverview;
