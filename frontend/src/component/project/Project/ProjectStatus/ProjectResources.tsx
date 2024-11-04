import { styled } from '@mui/material';
import { useProjectApiTokens } from 'hooks/api/getters/useProjectApiTokens/useProjectApiTokens';
import { useConnectedEnvironmentCount } from 'hooks/api/getters/useProjectApplications/useConnectedEnvironmentCount';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useMemo } from 'react';

const Wrapper = styled('article')(({ theme }) => ({
    backgroundColor: theme.palette.envAccordion.expanded,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadiusExtraLarge,
}));

const ProjectResourcesInner = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
}));

export const ProjectResources = () => {
    const projectId = useRequiredPathParam('projectId');
    const { project, loading: loadingProject } = useProjectOverview(projectId);
    const { tokens, loading: loadingTokens } = useProjectApiTokens(projectId);
    const { segments, loading: loadingSegments } = useSegments();
    const { data, loading: loadingEnvCount } =
        useConnectedEnvironmentCount(projectId);

    console.log(data);
    // todo: add sdk connections

    const segmentCount = useMemo(
        () =>
            segments?.filter((segment) => segment.project === projectId)
                .length ?? 0,
        [segments, projectId],
    );

    return (
        <Wrapper>
            <ProjectResourcesInner>
                <h3>Project Resources</h3>
                <span>{project.members} project member(s)</span>
                <span>{tokens.length} API key(s)</span>
                <span>1 SDK connection(s)</span>
                <span>{segmentCount} project segment(s)</span>
            </ProjectResourcesInner>
        </Wrapper>
    );
};
