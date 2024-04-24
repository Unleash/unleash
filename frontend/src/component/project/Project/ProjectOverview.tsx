import { type FC, useEffect } from 'react';
import { Box, styled } from '@mui/material';
import ProjectInfo from './ProjectInfo/ProjectInfo';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { ProjectStats } from './ProjectStats/ProjectStats';
import { ProjectFeatureToggles } from './PaginatedProjectFeatureToggles/ProjectFeatureToggles';
import useProjectOverview, {
    useProjectOverviewNameOrId,
} from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { usePageTitle } from 'hooks/usePageTitle';
import { useLastViewedProject } from 'hooks/useLastViewedProject';
import { useUiFlag } from 'hooks/useUiFlag';
import { ProjectOverviewChangeRequests } from './ProjectOverviewChangeRequests';
import { OldProjectFeatureToggles } from './PaginatedProjectFeatureToggles/OldProjectFeatureToggles';

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

const ProjectOverview: FC<{
    storageKey?: string;
}> = ({ storageKey = 'project-overview-v2' }) => {
    const projectOverviewRefactor = useUiFlag('projectOverviewRefactor');

    if (projectOverviewRefactor) {
        return <NewProjectOverview storageKey={storageKey} />;
    } else {
        return <OldProjectOverview storageKey={storageKey} />;
    }
};

const OldProjectOverview: FC<{
    storageKey?: string;
}> = ({ storageKey = 'project-overview-v2' }) => {
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

    const {
        members,
        featureTypeCounts,
        health,
        description,
        environments,
        stats,
    } = project;

    return (
        <StyledContainer key={projectId}>
            <ProjectInfo
                id={projectId}
                description={description}
                memberCount={members}
                health={health}
                featureTypeCounts={featureTypeCounts}
                stats={stats}
            />

            <StyledContentContainer>
                <ProjectStats stats={project.stats} />

                <StyledProjectToggles>
                    <OldProjectFeatureToggles
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

const NewProjectOverview: FC<{
    storageKey?: string;
}> = ({ storageKey = 'project-overview-v2' }) => {
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
                        refreshInterval={refreshInterval}
                        storageKey={storageKey}
                    />
                </StyledProjectToggles>
            </StyledContentContainer>
        </StyledContainer>
    );
};

export default ProjectOverview;
