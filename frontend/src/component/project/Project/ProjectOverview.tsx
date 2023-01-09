import useProject, {
    useProjectNameOrId,
} from 'hooks/api/getters/useProject/useProject';
import { styled } from '@mui/material';
import { ProjectFeatureToggles } from './ProjectFeatureToggles/ProjectFeatureToggles';
import ProjectInfo from './ProjectInfo/ProjectInfo';
import { usePageTitle } from 'hooks/usePageTitle';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useLastViewedProject } from '../../../hooks/useLastViewedProject';
import { useEffect } from 'react';

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

const ProjectOverview = () => {
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectNameOrId(projectId);
    const { project, loading } = useProject(projectId, { refreshInterval });
    const { members, features, health, description, environments } = project;
    usePageTitle(`Project overview – ${projectName}`);
    const { setLastViewed } = useLastViewedProject();

    useEffect(() => {
        setLastViewed(projectId);
    }, [projectId, setLastViewed]);

    return (
        <StyledContainer>
            <ProjectInfo
                id={projectId}
                description={description}
                memberCount={members}
                health={health}
                featureCount={features?.length}
            />
            <StyledProjectToggles>
                <ProjectFeatureToggles
                    features={features}
                    environments={environments}
                    loading={loading}
                />
            </StyledProjectToggles>
        </StyledContainer>
    );
};

export default ProjectOverview;
