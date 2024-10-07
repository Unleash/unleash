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
import LinkIcon from '@mui/icons-material/ArrowForward';
import { ProjectSetupComplete } from './ProjectSetupComplete';
import { ConnectSDK, CreateFlag, ExistingFlag } from './ConnectSDK';
import { LatestProjectEvents } from './LatestProjectEvents';
import { RoleAndOwnerInfo } from './RoleAndOwnerInfo';
import { forwardRef, type FC } from 'react';
import { StyledCardTitle } from './PersonalDashboard';
import type {
    PersonalDashboardProjectDetailsSchema,
    PersonalDashboardSchemaProjectsItem,
} from '../../openapi';
import {
    ContentGridContainer,
    EmptyGridItem,
    ListItemBox,
    listItemStyle,
    ProjectGrid,
    GridItem,
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

export const MyProjects = forwardRef<
    HTMLDivElement,
    {
        projects: PersonalDashboardSchemaProjectsItem[];
        personalDashboardProjectDetails?: PersonalDashboardProjectDetailsSchema;
        activeProject: string;
        setActiveProject: (project: string) => void;
    }
>(
    (
        {
            projects,
            personalDashboardProjectDetails,
            setActiveProject,
            activeProject,
        },
        ref,
    ) => {
        const activeProjectStage =
            personalDashboardProjectDetails?.onboardingStatus.status ??
            'loading';
        const setupIncomplete =
            activeProjectStage === 'onboarding-started' ||
            activeProjectStage === 'first-flag-created';

        return (
            <ContentGridContainer ref={ref}>
                <ProjectGrid>
                    <GridItem gridArea='title'>
                        <Typography variant='h3'>My projects</Typography>
                    </GridItem>
                    <GridItem
                        gridArea='onboarding'
                        sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                        }}
                    >
                        {setupIncomplete ? (
                            <Badge color='warning'>Setup incomplete</Badge>
                        ) : null}
                    </GridItem>
                    <SpacedGridItem gridArea='projects'>
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
                                            selected={
                                                project.id === activeProject
                                            }
                                            onClick={() =>
                                                setActiveProject(project.id)
                                            }
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
                    <SpacedGridItem gridArea='box1'>
                        {activeProjectStage === 'onboarded' &&
                        personalDashboardProjectDetails ? (
                            <ProjectSetupComplete
                                project={activeProject}
                                insights={
                                    personalDashboardProjectDetails.insights
                                }
                            />
                        ) : null}
                        {activeProjectStage === 'onboarding-started' ||
                        activeProjectStage === 'loading' ? (
                            <CreateFlag project={activeProject} />
                        ) : null}
                        {activeProjectStage === 'first-flag-created' ? (
                            <ExistingFlag project={activeProject} />
                        ) : null}
                    </SpacedGridItem>
                    <SpacedGridItem gridArea='box2'>
                        {activeProjectStage === 'onboarded' &&
                        personalDashboardProjectDetails ? (
                            <LatestProjectEvents
                                latestEvents={
                                    personalDashboardProjectDetails.latestEvents
                                }
                            />
                        ) : null}
                        {setupIncomplete || activeProjectStage === 'loading' ? (
                            <ConnectSDK project={activeProject} />
                        ) : null}
                    </SpacedGridItem>
                    <EmptyGridItem />
                    <GridItem gridArea='owners'>
                        {personalDashboardProjectDetails ? (
                            <RoleAndOwnerInfo
                                roles={personalDashboardProjectDetails.roles.map(
                                    (role) => role.name,
                                )}
                                owners={personalDashboardProjectDetails.owners}
                            />
                        ) : null}
                    </GridItem>
                </ProjectGrid>
            </ContentGridContainer>
        );
    },
);
