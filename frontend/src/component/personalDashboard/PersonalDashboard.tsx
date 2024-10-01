import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import {
    Box,
    Grid,
    IconButton,
    Link,
    List,
    ListItem,
    ListItemButton,
    styled,
    Typography,
} from '@mui/material';
import type { Theme } from '@mui/material/styles/createTheme';
import { ProjectIcon } from 'component/common/ProjectIcon/ProjectIcon';
import React, { type FC, useEffect, useState } from 'react';
import LinkIcon from '@mui/icons-material/Link';
import { Badge } from '../common/Badge/Badge';
import { ConnectSDK, CreateFlag, ExistingFlag } from './ConnectSDK';
import { WelcomeDialog } from './WelcomeDialog';
import { useLocalStorageState } from 'hooks/useLocalStorageState';
import { ProjectSetupComplete } from './ProjectSetupComplete';
import { usePersonalDashboard } from 'hooks/api/getters/usePersonalDashboard/usePersonalDashboard';
import { getFeatureTypeIcons } from 'utils/getFeatureTypeIcons';
import type {
    PersonalDashboardSchema,
    PersonalDashboardSchemaProjectsItem,
} from '../../openapi';
import { FlagExposure } from 'component/feature/FeatureView/FeatureOverview/FeatureLifecycle/FlagExposure';
import { RoleAndOwnerInfo } from './RoleAndOwnerInfo';
import { ContentGridNoProjects } from './ContentGridNoProjects';
import { LatestProjectEvents } from './LatestProjectEvents';
import { usePersonalDashboardProjectDetails } from 'hooks/api/getters/usePersonalDashboard/usePersonalDashboardProjectDetails';
import HelpOutline from '@mui/icons-material/HelpOutline';
import useLoading from '../../hooks/useLoading';

const ScreenExplanation = styled('div')(({ theme }) => ({
    marginBottom: theme.spacing(4),
    display: 'flex',
    alignItems: 'center',
}));

const ContentGrid = styled(Grid)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
}));

const ProjectBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'center',
    width: '100%',
}));

const projectStyle = (theme: Theme) => ({
    borderRadius: theme.spacing(0.5),
    borderLeft: `${theme.spacing(0.5)} solid transparent`,
    '&.Mui-selected': {
        borderLeft: `${theme.spacing(0.5)} solid ${theme.palette.primary.main}`,
    },
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(1),
});

export const StyledCardTitle = styled('div')<{ lines?: number }>(
    ({ theme, lines = 2 }) => ({
        fontWeight: theme.typography.fontWeightRegular,
        fontSize: theme.typography.body1.fontSize,
        lineClamp: `${lines}`,
        WebkitLineClamp: lines,
        lineHeight: '1.2',
        display: '-webkit-box',
        boxOrient: 'vertical',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        alignItems: 'flex-start',
        WebkitBoxOrient: 'vertical',
        wordBreak: 'break-word',
    }),
);

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

const SpacedGridItem = styled(Grid)(({ theme }) => ({
    padding: theme.spacing(4),
    border: `0.5px solid ${theme.palette.divider}`,
}));

const useProjects = (projects: PersonalDashboardSchemaProjectsItem[]) => {
    const [activeProject, setActiveProject] = useState(projects[0]?.id);

    useEffect(() => {
        if (!activeProject && projects.length > 0) {
            setActiveProject(projects[0].id);
        }
    }, [JSON.stringify(projects)]);

    return { projects, activeProject, setActiveProject };
};

const FlagListItem: FC<{
    flag: { name: string; project: string; type: string };
    selected: boolean;
    onClick: () => void;
}> = ({ flag, selected, onClick }) => {
    const IconComponent = getFeatureTypeIcons(flag.type);
    return (
        <ListItem key={flag.name} disablePadding={true} sx={{ mb: 1 }}>
            <ListItemButton
                sx={projectStyle}
                selected={selected}
                onClick={onClick}
            >
                <ProjectBox>
                    <IconComponent color='primary' />
                    <StyledCardTitle>{flag.name}</StyledCardTitle>
                    <IconButton
                        component={Link}
                        href={`projects/${flag.project}/features/${flag.name}`}
                        size='small'
                        sx={{ ml: 'auto' }}
                    >
                        <LinkIcon
                            titleAccess={`projects/${flag.project}/features/${flag.name}`}
                        />
                    </IconButton>
                </ProjectBox>
            </ListItemButton>
        </ListItem>
    );
};

export const PersonalDashboard = () => {
    const { user } = useAuthUser();

    const name = user?.name;

    const {
        personalDashboard,
        refetch: refetchDashboard,
        loading: personalDashboardLoading,
    } = usePersonalDashboard();
    const [activeFlag, setActiveFlag] = useState<
        PersonalDashboardSchema['flags'][0] | null
    >(null);
    useEffect(() => {
        if (personalDashboard?.flags.length) {
            setActiveFlag(personalDashboard.flags[0]);
        }
    }, [JSON.stringify(personalDashboard?.flags)]);

    const { projects, activeProject, setActiveProject } = useProjects(
        personalDashboard?.projects || [],
    );

    const { personalDashboardProjectDetails, loading: loadingDetails } =
        usePersonalDashboardProjectDetails(activeProject);

    const stage =
        personalDashboardProjectDetails?.onboardingStatus.status ?? 'loading';

    const [welcomeDialog, setWelcomeDialog] = useLocalStorageState<
        'open' | 'closed'
    >('welcome-dialog:v1', 'open');

    const noProjects = projects.length === 0;

    const setupIncomplete =
        personalDashboardProjectDetails?.onboardingStatus.status ===
            'onboarding-started' ||
        personalDashboardProjectDetails?.onboardingStatus.status ===
            'first-flag-created';
    const onboarded =
        personalDashboardProjectDetails?.onboardingStatus.status ===
        'onboarded';

    const projectStageRef = useLoading(stage === 'loading');

    return (
        <div ref={projectStageRef}>
            <Typography component='h2' variant='h2'>
                Welcome {name}
            </Typography>
            <ScreenExplanation>
                <p data-loading>
                    {onboarded
                        ? 'We have gathered projects and flags you have favorited or owned'
                        : null}
                    {setupIncomplete
                        ? 'Here are some tasks we think would be useful in order to get the most out of Unleash'
                        : null}
                    {stage === 'loading'
                        ? 'We have gathered projects and flags you have favorited or owned'
                        : null}
                </p>
                <IconButton
                    data-loading
                    size={'small'}
                    title='Key concepts'
                    onClick={() => setWelcomeDialog('open')}
                >
                    <HelpOutline />
                </IconButton>
            </ScreenExplanation>

            {noProjects && personalDashboard ? (
                <ContentGridNoProjects
                    owners={personalDashboard.projectOwners}
                    admins={personalDashboard.admins}
                />
            ) : (
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
                                            sx={projectStyle}
                                            selected={
                                                project.id === activeProject
                                            }
                                            onClick={() =>
                                                setActiveProject(project.id)
                                            }
                                        >
                                            <ProjectBox>
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
                                            </ProjectBox>
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
                        {stage === 'onboarding-started' ||
                        stage === 'loading' ? (
                            <CreateFlag project={activeProject} />
                        ) : null}
                        {stage === 'first-flag-created' ? (
                            <ExistingFlag project={activeProject} />
                        ) : null}
                    </SpacedGridItem>
                    <SpacedGridItem item lg={4} md={1}>
                        {stage === 'onboarded' &&
                        personalDashboardProjectDetails ? (
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
            )}
            <ContentGrid container columns={{ lg: 12, md: 1 }} sx={{ mt: 2 }}>
                <SpacedGridItem item lg={4} md={1}>
                    <Typography variant='h3'>My feature flags</Typography>
                </SpacedGridItem>
                <SpacedGridItem
                    item
                    lg={8}
                    md={1}
                    sx={{ display: 'flex', justifyContent: 'flex-end' }}
                >
                    {activeFlag ? (
                        <FlagExposure
                            project={activeFlag.project}
                            flagName={activeFlag.name}
                            onArchive={refetchDashboard}
                        />
                    ) : null}
                </SpacedGridItem>
                <SpacedGridItem item lg={4} md={1}>
                    {personalDashboard && personalDashboard.flags.length > 0 ? (
                        <List
                            disablePadding={true}
                            sx={{ maxHeight: '400px', overflow: 'auto' }}
                        >
                            {personalDashboard.flags.map((flag) => (
                                <FlagListItem
                                    key={flag.name}
                                    flag={flag}
                                    selected={flag.name === activeFlag?.name}
                                    onClick={() => setActiveFlag(flag)}
                                />
                            ))}
                        </List>
                    ) : (
                        <Typography>
                            You have not created or favorited any feature flags.
                            Once you do, they will show up here.
                        </Typography>
                    )}
                </SpacedGridItem>

                <SpacedGridItem item lg={8} md={1}>
                    {activeFlag ? (
                        <FlagMetricsChart flag={activeFlag} />
                    ) : (
                        <PlaceholderFlagMetricsChart />
                    )}
                </SpacedGridItem>
            </ContentGrid>
            <WelcomeDialog
                open={welcomeDialog === 'open'}
                onClose={() => setWelcomeDialog('closed')}
            />
        </div>
    );
};

const FlagMetricsChart = React.lazy(() =>
    import('./FlagMetricsChart').then((module) => ({
        default: module.FlagMetricsChart,
    })),
);
const PlaceholderFlagMetricsChart = React.lazy(() =>
    import('./FlagMetricsChart').then((module) => ({
        default: module.PlaceholderFlagMetricsChart,
    })),
);
