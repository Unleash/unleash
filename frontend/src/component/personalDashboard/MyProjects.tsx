import {
    Box,
    IconButton,
    Link,
    List,
    ListItem,
    ListItemButton,
    Typography,
} from '@mui/material';
import { Badge } from '../common/Badge/Badge';
import { ProjectIcon } from '../common/ProjectIcon/ProjectIcon';
import LinkIcon from '@mui/icons-material/Link';
import { ProjectSetupComplete } from './ProjectSetupComplete';
import { ConnectSDK, CreateFlag, ExistingFlag } from './ConnectSDK';
import { LatestProjectEvents } from './LatestProjectEvents';
import { RoleAndOwnerInfo } from './RoleAndOwnerInfo';
import type { FC } from 'react';
import { StyledCardTitle } from './PersonalDashboard';
import type {
    PersonalDashboardProjectDetailsSchema,
    PersonalDashboardSchemaProjectsItem,
} from '../../openapi';
import {
    ContentGrid,
    ListItemBox,
    listItemStyle,
    SpacedGridItem,
} from './Grid';

const ActiveProjectDetails: FC<{
    project: PersonalDashboardSchemaProjectsItem;
}> = ({ project }) => {
    return (
        <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant='subtitle2' color='primary'>
                    {project.featureCount}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                    flags
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant='subtitle2' color='primary'>
                    {project.memberCount}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                    members
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant='subtitle2' color='primary'>
                    {project.health}%
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                    health
                </Typography>
            </Box>
        </Box>
    );
};

export const MyProjects: FC<{
    projects: PersonalDashboardSchemaProjectsItem[];
    personalDashboardProjectDetails?: PersonalDashboardProjectDetailsSchema;
    activeProject: string;
    setActiveProject: (project: string) => void;
}> = ({
    projects,
    personalDashboardProjectDetails,
    setActiveProject,
    activeProject,
}) => {
    const stage =
        personalDashboardProjectDetails?.onboardingStatus.status ?? 'loading';
    const setupIncomplete =
        stage === 'onboarding-started' || stage === 'first-flag-created';

    return (
        <ContentGrid container columns={{ lg: 12, md: 1 }}>
            <SpacedGridItem item lg={4} md={1}>
                <Typography variant='h3'>My projects</Typography>
            </SpacedGridItem>
            <SpacedGridItem
                item
                lg={8}
                md={1}
                sx={{ display: 'flex', justifyContent: 'flex-end' }}
            >
                {setupIncomplete ? (
                    <Badge color='warning'>Setup incomplete</Badge>
                ) : null}
            </SpacedGridItem>
            <SpacedGridItem item lg={4} md={1}>
                <List
                    disablePadding={true}
                    sx={{ maxHeight: '400px', overflow: 'auto' }}
                >
                    {projects.map((project) => {
                        return (
                            <ListItem
                                key={project.id}
                                disablePadding={true}
                                sx={{ mb: 1 }}
                            >
                                <ListItemButton
                                    sx={listItemStyle}
                                    selected={project.id === activeProject}
                                    onClick={() => setActiveProject(project.id)}
                                >
                                    <ListItemBox>
                                        <ProjectIcon color='primary' />
                                        <StyledCardTitle>
                                            {project.name}
                                        </StyledCardTitle>
                                        <IconButton
                                            component={Link}
                                            href={`projects/${project.id}`}
                                            size='small'
                                            sx={{ ml: 'auto' }}
                                        >
                                            <LinkIcon
                                                titleAccess={`projects/${project.id}`}
                                            />
                                        </IconButton>
                                    </ListItemBox>
                                    {project.id === activeProject ? (
                                        <ActiveProjectDetails
                                            project={project}
                                        />
                                    ) : null}
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </SpacedGridItem>
            <SpacedGridItem item lg={4} md={1}>
                {stage === 'onboarded' ? (
                    <ProjectSetupComplete project={activeProject} />
                ) : null}
                {stage === 'onboarding-started' || stage === 'loading' ? (
                    <CreateFlag project={activeProject} />
                ) : null}
                {stage === 'first-flag-created' ? (
                    <ExistingFlag project={activeProject} />
                ) : null}
            </SpacedGridItem>
            <SpacedGridItem item lg={4} md={1}>
                {stage === 'onboarded' && personalDashboardProjectDetails ? (
                    <LatestProjectEvents
                        latestEvents={
                            personalDashboardProjectDetails.latestEvents
                        }
                    />
                ) : null}
                {setupIncomplete || stage === 'loading' ? (
                    <ConnectSDK project={activeProject} />
                ) : null}
            </SpacedGridItem>
            <SpacedGridItem item lg={4} md={1} />
            <SpacedGridItem item lg={8} md={1}>
                {activeProject ? (
                    <RoleAndOwnerInfo
                        roles={['owner', 'custom']}
                        owners={[{ ownerType: 'system' }]}
                    />
                ) : null}
            </SpacedGridItem>
        </ContentGrid>
    );
};
