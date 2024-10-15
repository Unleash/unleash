import {
    Box,
    IconButton,
    ListItem,
    ListItemButton,
    Typography,
} from '@mui/material';
import { ProjectIcon } from '../common/ProjectIcon/ProjectIcon';
import LinkIcon from '@mui/icons-material/ArrowForward';
import { ProjectSetupComplete } from './ProjectSetupComplete';
import { ConnectSDK, CreateFlag, ExistingFlag } from './ConnectSDK';
import { LatestProjectEvents } from './LatestProjectEvents';
import { RoleAndOwnerInfo } from './RoleAndOwnerInfo';
import { forwardRef, useEffect, useRef, type FC } from 'react';
import type {
    PersonalDashboardProjectDetailsSchema,
    PersonalDashboardSchemaAdminsItem,
    PersonalDashboardSchemaProjectOwnersItem,
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
    StyledList,
    StyledCardTitle,
} from './SharedComponents';
import { ContactAdmins, DataError } from './ProjectDetailsError';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { Link } from 'react-router-dom';
import { ActionBox } from './ActionBox';
import { NoProjectsContactAdmin } from './NoProjectsContactAdmin';
import { AskOwnerToAddYouToTheirProject } from './AskOwnerToAddYouToTheirProject';

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

const ProjectListItem: FC<{
    project: PersonalDashboardSchemaProjectsItem;
    selected: boolean;
    onClick: () => void;
}> = ({ project, selected, onClick }) => {
    const activeProjectRef = useRef<HTMLLIElement>(null);
    const { trackEvent } = usePlausibleTracker();

    useEffect(() => {
        if (activeProjectRef.current) {
            activeProjectRef.current.scrollIntoView({
                block: 'nearest',
                inline: 'start',
            });
        }
    }, []);

    return (
        <ListItem
            disablePadding={true}
            sx={{ mb: 1 }}
            ref={selected ? activeProjectRef : null}
        >
            <ListItemButton
                sx={listItemStyle}
                selected={selected}
                onClick={onClick}
            >
                <ListItemBox>
                    <ProjectIcon color='primary' />
                    <StyledCardTitle>{project.name}</StyledCardTitle>
                    <IconButton
                        component={Link}
                        to={`/projects/${project.id}`}
                        size='small'
                        sx={{ ml: 'auto' }}
                        onClick={() => {
                            trackEvent('personal-dashboard', {
                                props: {
                                    eventType: `Go to project from list`,
                                },
                            });
                        }}
                    >
                        <LinkIcon titleAccess={`projects/${project.id}`} />
                    </IconButton>
                </ListItemBox>
                {selected ? <ActiveProjectDetails project={project} /> : null}
            </ListItemButton>
        </ListItem>
    );
};

type MyProjectsState = 'no projects' | 'projects' | 'projects with error';

export const MyProjects = forwardRef<
    HTMLDivElement,
    {
        projects: PersonalDashboardSchemaProjectsItem[];
        personalDashboardProjectDetails?: PersonalDashboardProjectDetailsSchema;
        activeProject: string;
        setActiveProject: (project: string) => void;
        admins: PersonalDashboardSchemaAdminsItem[];
        owners: PersonalDashboardSchemaProjectOwnersItem[];
    }
>(
    (
        {
            projects,
            personalDashboardProjectDetails,
            setActiveProject,
            activeProject,
            admins,
            owners,
        },
        ref,
    ) => {
        const state: MyProjectsState = projects.length
            ? personalDashboardProjectDetails
                ? 'projects'
                : 'projects with error'
            : 'no projects';

        const activeProjectStage =
            personalDashboardProjectDetails?.onboardingStatus.status ??
            'loading';
        const setupIncomplete =
            activeProjectStage === 'onboarding-started' ||
            activeProjectStage === 'first-flag-created';

        const box1Content = () => {
            if (state === 'no projects') {
                return <NoProjectsContactAdmin admins={admins} />;
            }

            if (state === 'projects with error') {
                return <DataError project={activeProject} />;
            }

            if (
                activeProjectStage === 'onboarded' &&
                personalDashboardProjectDetails
            ) {
                return (
                    <ProjectSetupComplete
                        project={activeProject}
                        insights={personalDashboardProjectDetails.insights}
                    />
                );
            } else if (
                activeProjectStage === 'onboarding-started' ||
                activeProjectStage === 'loading'
            ) {
                return <CreateFlag project={activeProject} />;
            } else if (activeProjectStage === 'first-flag-created') {
                return <ExistingFlag project={activeProject} />;
            }
        };

        const box2Content = () => {
            if (state === 'no projects') {
                return <AskOwnerToAddYouToTheirProject owners={owners} />;
            }

            if (state === 'projects with error') {
                return <ContactAdmins admins={admins} />;
            }

            if (
                activeProjectStage === 'onboarded' &&
                personalDashboardProjectDetails
            ) {
                return (
                    <LatestProjectEvents
                        latestEvents={
                            personalDashboardProjectDetails.latestEvents
                        }
                    />
                );
            }

            if (setupIncomplete || activeProjectStage === 'loading') {
                return <ConnectSDK project={activeProject} />;
            }
        };

        const projectListContent = () => {
            if (state === 'no projects') {
                return (
                    <ActionBox>
                        <Typography>
                            You don't currently have access to any projects in
                            the system.
                        </Typography>
                        <Typography>
                            To get started, you can{' '}
                            <Link to='/projects?create=true'>
                                create your own project
                            </Link>
                            . Alternatively, you can review the available
                            projects in the system and ask the owner for access.
                        </Typography>
                    </ActionBox>
                );
            }

            return (
                <StyledList>
                    {projects.map((project) => (
                        <ProjectListItem
                            key={project.id}
                            project={project}
                            selected={project.id === activeProject}
                            onClick={() => setActiveProject(project.id)}
                        />
                    ))}
                </StyledList>
            );
        };

        return (
            <ContentGridContainer ref={ref}>
                <ProjectGrid>
                    <SpacedGridItem gridArea='projects'>
                        {projectListContent()}
                    </SpacedGridItem>
                    <SpacedGridItem gridArea='box1'>
                        {box1Content()}
                    </SpacedGridItem>
                    <SpacedGridItem gridArea='box2'>
                        {box2Content()}
                    </SpacedGridItem>
                    <EmptyGridItem />
                    <GridItem gridArea='owners'>
                        <RoleAndOwnerInfo
                            roles={
                                personalDashboardProjectDetails?.roles.map(
                                    (role) => role.name,
                                ) ?? []
                            }
                            owners={
                                personalDashboardProjectDetails?.owners ?? [
                                    { ownerType: 'user', name: '?' },
                                ]
                            }
                        />
                    </GridItem>
                </ProjectGrid>
            </ContentGridContainer>
        );
    },
);
