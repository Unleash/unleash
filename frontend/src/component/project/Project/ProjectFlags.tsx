import { type FC, useEffect } from 'react';
import { Box, styled } from '@mui/material';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { ProjectFeatureToggles } from './PaginatedProjectFeatureToggles/ProjectFeatureToggles.tsx';
import useProjectOverview, {
    useProjectOverviewNameOrId,
} from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { usePageTitle } from 'hooks/usePageTitle';
import { useLastViewedProject } from 'hooks/useLastViewedProject';
import { OutdatedSdksBanner } from '../../banners/OutdatedSdksBanner/OutdatedSdksBanner.tsx';
import { useUiFlag } from 'hooks/useUiFlag';
import { ConditionallyRender } from '../../common/ConditionallyRender/ConditionallyRender.tsx';

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

    const outdatedSdksBannerEnabled = useUiFlag('outdatedSdksBanner');

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
                <ConditionallyRender
                    condition={outdatedSdksBannerEnabled}
                    show={<OutdatedSdksBanner project={projectId} />}
                />
                <StyledProjectToggles>
                    <ProjectFeatureToggles
                        environments={
                            project.environments?.map(
                                (environment) => environment.environment,
                            ) || []
                        }
                    />
                </StyledProjectToggles>
            </StyledContentContainer>
        </StyledContainer>
    );
};

export default ProjectOverview;
