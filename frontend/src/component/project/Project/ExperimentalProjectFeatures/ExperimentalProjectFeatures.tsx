import { useEffect } from 'react';
import useProject, {
    useProjectNameOrId,
} from 'hooks/api/getters/useProject/useProject';
import { Box, styled } from '@mui/material';
import { ProjectFeatureToggles } from '../ProjectFeatureToggles/ProjectFeatureToggles';
import { usePageTitle } from 'hooks/usePageTitle';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useLastViewedProject } from 'hooks/useLastViewedProject';

import { useUiFlag } from 'hooks/useUiFlag';
import { ExperimentalProjectFeatureToggles } from './ExperimentalProjectTable/ExperimentalProjectTable';

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

const PaginatedProjectOverview = () => {
    const projectId = useRequiredPathParam('projectId');
    const { project, loading: projectLoading } = useProject(projectId, {
        refreshInterval,
    });

    const { environments } = project;

    return (
        <StyledContainer>
            <StyledContentContainer>
                <StyledProjectToggles>
                    <ExperimentalProjectFeatureToggles
                        style={{ width: '100%', margin: 0 }}
                        environments={environments}
                        storageKey='project-features'
                    />
                </StyledProjectToggles>
            </StyledContentContainer>
        </StyledContainer>
    );
};

/**
 * @deprecated remove when flag `featureSearchFrontend` is removed
 */
export const ExperimentalProjectFeatures = () => {
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectNameOrId(projectId);
    const { project, loading, refetch } = useProject(projectId, {
        refreshInterval,
    });
    const { features, environments } = project;
    usePageTitle(`Project overview – ${projectName}`);
    const { setLastViewed } = useLastViewedProject();
    const featureSearchFrontend = useUiFlag('featureSearchFrontend');

    useEffect(() => {
        setLastViewed(projectId);
    }, [projectId, setLastViewed]);

    if (featureSearchFrontend) return <PaginatedProjectOverview />;

    return (
        <StyledContainer>
            <StyledContentContainer>
                <StyledProjectToggles>
                    <ProjectFeatureToggles
                        style={{ width: '100%', margin: 0 }}
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
