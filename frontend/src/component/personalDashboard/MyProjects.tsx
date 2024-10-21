import type { RemoteData } from './RemoteData';
import {
    Box,
    IconButton,
    ListItem,
    ListItemButton,
    Typography,
    styled,
} from '@mui/material';
import { ProjectIcon } from '../common/ProjectIcon/ProjectIcon';
import LinkIcon from '@mui/icons-material/ArrowForward';
import { ProjectSetupComplete } from './ProjectSetupComplete';
import { ConnectSDK, CreateFlag, ExistingFlag } from './ConnectSDK';
import { LatestProjectEvents } from './LatestProjectEvents';
import { RoleAndOwnerInfo } from './RoleAndOwnerInfo';
import { type ReactNode, forwardRef, useEffect, useRef, type FC } from 'react';
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
import useLoading from 'hooks/useLoading';

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

const SkeletonDiv = styled('div')({
    height: '80%',
});

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

export const MyProjects = forwardRef<
    HTMLDivElement,
    {
        projects: PersonalDashboardSchemaProjectsItem[];
        personalDashboardProjectDetails: RemoteData<PersonalDashboardProjectDetailsSchema>;
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
        // ref,
    ) => {
        const ref = useLoading(
            personalDashboardProjectDetails.state === 'loading',
        );

        // const state: MyProjectsState = projects.length
        //     ? personalDashboardProjectDetails
        //         ? 'projects'
        //         : 'projects with error or loading'
        //     : 'no projects';

        const getGridContents = (): {
            list: ReactNode;
            box1: ReactNode;
            box2: ReactNode;
        } => {
            const list = projects.length ? (
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
            ) : (
                <ActionBox>
                    <Typography>
                        You don't currently have access to any projects in the
                        system.
                    </Typography>
                    <Typography>
                        To get started, you can{' '}
                        <Link to='/projects?create=true'>
                            create your own project
                        </Link>
                        . Alternatively, you can review the available projects
                        in the system and ask the owner for access.
                    </Typography>
                </ActionBox>
            );

            const [box1, box2] = (() => {
                switch (personalDashboardProjectDetails.state) {
                    case 'success': {
                        const activeProjectStage =
                            personalDashboardProjectDetails.data
                                .onboardingStatus.status ?? 'loading';
                        const setupIncomplete =
                            activeProjectStage === 'onboarding-started' ||
                            activeProjectStage === 'first-flag-created';

                        if (activeProjectStage === 'onboarded') {
                            return [
                                <ProjectSetupComplete
                                    project={activeProject}
                                    insights={
                                        personalDashboardProjectDetails.data
                                            .insights
                                    }
                                />,
                                <LatestProjectEvents
                                    latestEvents={
                                        personalDashboardProjectDetails.data
                                            .latestEvents
                                    }
                                />,
                            ];
                        } else if (setupIncomplete) {
                            return [
                                <CreateFlag project={activeProject} />,
                                <ConnectSDK project={activeProject} />,
                            ];
                        } else {
                            return [
                                <ExistingFlag project={activeProject} />,
                                <ConnectSDK project={activeProject} />,
                            ];
                        }
                    }
                    case 'error':
                        return [
                            <DataError project={activeProject} />,
                            <ContactAdmins admins={admins} />,
                        ];
                    default: // loading
                        return [
                            <SkeletonDiv data-loading />,
                            <SkeletonDiv data-loading />,
                        ];
                }
            })();

            return { list, box1, box2 };
        };

        const { list, box1, box2 } = getGridContents();
        return (
            <ContentGridContainer ref={ref}>
                <ProjectGrid>
                    <SpacedGridItem gridArea='projects'>{list}</SpacedGridItem>
                    <SpacedGridItem gridArea='box1'>{box1}</SpacedGridItem>
                    <SpacedGridItem gridArea='box2'>{box2}</SpacedGridItem>
                    <EmptyGridItem />
                    <GridItem gridArea='owners'>
                        <RoleAndOwnerInfo
                            roles={
                                personalDashboardProjectDetails.state ===
                                'success'
                                    ? personalDashboardProjectDetails.data.roles.map(
                                          (role) => role.name,
                                      )
                                    : []
                            }
                            owners={
                                personalDashboardProjectDetails.state ===
                                'success'
                                    ? personalDashboardProjectDetails.data
                                          .owners
                                    : [{ ownerType: 'user', name: '?' }]
                            }
                        />
                    </GridItem>
                </ProjectGrid>
            </ContentGridContainer>
        );
    },
);
