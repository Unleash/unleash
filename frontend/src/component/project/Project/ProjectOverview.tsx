import { type FC, useEffect } from 'react';
import { Box, styled } from '@mui/material';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { ProjectFeatureToggles } from './PaginatedProjectFeatureToggles/ProjectFeatureToggles';
import useProjectOverview, {
    useProjectOverviewNameOrId,
} from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { usePageTitle } from 'hooks/usePageTitle';
import { useLastViewedProject } from 'hooks/useLastViewedProject';
import { ProjectOverviewChangeRequests } from './ProjectOverviewChangeRequests';

const refreshInterval = 15 * 1000;

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
        flexDirection: 'column',
    },
}));

const StyledProjectToggles = styled('div')(() => ({
    width: '100%',
    minWidth: 0,
}));

const StyledContentContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    width: '100%',
    minWidth: 0,
}));

const ProjectOverview: FC = () => {
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectOverviewNameOrId(projectId);

    const { project } = useProjectOverview(projectId, {
        refreshInterval,
    });

    usePageTitle(`Project overview – ${projectName}`);
    const { setLastViewed } = useLastViewedProject();
    useEffect(() => {
        setLastViewed(projectId);
    }, [projectId, setLastViewed]);

    return (
        <StyledContainer key={projectId}>
            <StyledContentContainer>
                <ProjectOverviewChangeRequests project={projectId} />

                <StyledProjectToggles>
                    <ProjectFeatureToggles
                        environments={project.environments.map(
                            (environment) => environment.environment,
                        )}
                    />
                </StyledProjectToggles>
            </StyledContentContainer>
        </StyledContainer>
    );
};

export default ProjectOverview;
