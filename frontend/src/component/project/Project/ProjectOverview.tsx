import useProject, {
    useProjectNameOrId,
} from 'hooks/api/getters/useProject/useProject';
import { Box, styled } from '@mui/material';
import { ProjectFeatureToggles } from './ProjectFeatureToggles/ProjectFeatureToggles';
import ProjectInfo from './ProjectInfo/ProjectInfo';
import { usePageTitle } from 'hooks/usePageTitle';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useLastViewedProject } from '../../../hooks/useLastViewedProject';
import { useEffect } from 'react';
import { StatusBox } from './StatusBox/StatusBox';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

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
    const { uiConfig } = useUiConfig();

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
            <Box
                sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}
            >
                <ConditionallyRender
                    condition={uiConfig?.flags.newProjectOverview}
                    show={<ProjectStatus />}
                />
                <StyledProjectToggles>
                    <ProjectFeatureToggles
                        features={features}
                        environments={environments}
                        loading={loading}
                    />
                </StyledProjectToggles>
            </Box>
        </StyledContainer>
    );
};

const ProjectStatus = () => {
    return (
        <Box
            sx={{
                padding: '0 0 1rem 1rem',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
            }}
        >
            <StatusBox title="Total changes" boxText={'86'} change={-24} />
            <StatusBox
                title="Total changes"
                boxText={'6 days'}
                change={-12}
            />{' '}
            <StatusBox title="Total changes" boxText={'86'} change={-24} />
            <StatusBox title="Total changes" boxText={'86'} change={-24} />
        </Box>
    );
};

export default ProjectOverview;
