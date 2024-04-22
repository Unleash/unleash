import { type FC, useEffect, useState } from 'react';
import { Box, styled } from '@mui/material';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { ProjectFeatureToggles } from './PaginatedProjectFeatureToggles/ProjectFeatureToggles';
import useProjectOverview, {
    useProjectOverviewNameOrId,
} from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { usePageTitle } from 'hooks/usePageTitle';
import { useLastViewedProject } from 'hooks/useLastViewedProject';
import { useUiFlag } from 'hooks/useUiFlag';
import { ProjectOverviewChangeRequests } from './ProjectOverviewChangeRequests';
import { useFeedback } from '../../feedbackNew/useFeedback';

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

const useDelayedFeedbackPrompt = () => {
    const { openFeedback, hasSubmittedFeedback } = useFeedback(
        'newProjectOverview',
        'manual',
    );
    const projectOverviewRefactorFeedback = useUiFlag(
        'projectOverviewRefactorFeedback',
    );

    const [seenFeedback, setSeenFeedback] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => {
            if (
                projectOverviewRefactorFeedback &&
                !seenFeedback &&
                !hasSubmittedFeedback
            ) {
                openFeedback({
                    title: 'How easy was it to work with the project overview in Unleash?',
                    positiveLabel:
                        'What do you like most about the updated project overview?',
                    areasForImprovementsLabel:
                        'What improvements are needed in the project overview?',
                });
                setSeenFeedback(true);
            }
        }, 30000);

        return () => clearTimeout(timer);
    }, [hasSubmittedFeedback, openFeedback, seenFeedback]);
};

export const ProjectOverview: FC<{
    storageKey?: string;
}> = ({ storageKey = 'project-overview-v2' }) => {
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectOverviewNameOrId(projectId);

    const { project } = useProjectOverview(projectId, {
        refreshInterval,
    });
    useDelayedFeedbackPrompt();

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
                        refreshInterval={refreshInterval}
                        storageKey={storageKey}
                    />
                </StyledProjectToggles>
            </StyledContentContainer>
        </StyledContainer>
    );
};

export default ProjectOverview;
