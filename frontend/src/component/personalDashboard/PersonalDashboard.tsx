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
import { type FC, useEffect, useState } from 'react';
import { useProfile } from 'hooks/api/getters/useProfile/useProfile';
import LinkIcon from '@mui/icons-material/Link';
import { Badge } from '../common/Badge/Badge';
import { ConnectSDK, CreateFlag } from './ConnectSDK';
import {
    FlagMetricsChart,
    PlaceholderFlagMetricsChart,
} from './FlagMetricsChart';
import { WelcomeDialog } from './WelcomeDialog';
import { useLocalStorageState } from 'hooks/useLocalStorageState';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { ProjectSetupComplete } from './ProjectSetupComplete';
import { usePersonalDashboard } from 'hooks/api/getters/usePersonalDashboard/usePersonalDashboard';
import { getFeatureTypeIcons } from 'utils/getFeatureTypeIcons';
import type { PersonalDashboardSchema } from '../../openapi';

const ScreenExplanation = styled(Typography)(({ theme }) => ({
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(8),
    maxWidth: theme.spacing(45),
}));

const StyledHeaderTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.h2.fontSize,
    fontWeight: 'normal',
    marginBottom: theme.spacing(2),
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
    project: { flags: number; members: number; health: number };
}> = ({ project }) => {
    return (
        <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant='subtitle2' color='primary'>
                    {project.flags}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                    flags
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant='subtitle2' color='primary'>
                    {project.members}
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

const useProjects = () => {
    const myProjects = useProfile().profile?.projects || [];

    // TODO: add real data for flags/members/health
    const projects = myProjects.map((project) => ({
        name: project,
        flags: 0,
        members: 1,
        health: 100,
    }));

    const [activeProject, setActiveProject] = useState(projects[0]?.name);

    useEffect(() => {
        if (!activeProject && projects.length > 0) {
            setActiveProject(projects[0].name);
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

    const { projects, activeProject, setActiveProject } = useProjects();

    const { personalDashboard } = usePersonalDashboard();
    const [activeFlag, setActiveFlag] = useState<
        PersonalDashboardSchema['flags'][0] | null
    >(null);
    useEffect(() => {
        if (personalDashboard?.flags.length) {
            setActiveFlag(personalDashboard.flags[0]);
        }
    }, [JSON.stringify(personalDashboard)]);

    const { project: activeProjectOverview, loading } =
        useProjectOverview(activeProject);

    const onboardingCompleted = Boolean(
        !loading &&
            activeProject &&
            activeProjectOverview?.onboardingStatus.status === 'onboarded',
    );

    const [welcomeDialog, setWelcomeDialog] = useLocalStorageState<
        'seen' | 'not_seen'
    >('welcome-dialog:v1', 'not_seen');

    return (
        <div>
            <Typography component='h2' variant='h2'>
                Welcome {name}
            </Typography>
            <ScreenExplanation>
                Here are some tasks we think would be useful in order to get the
                most of Unleash
            </ScreenExplanation>
            <StyledHeaderTitle>Your resources</StyledHeaderTitle>
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
                    <Badge color='warning'>Setup incomplete</Badge>
                </SpacedGridItem>
                <SpacedGridItem item lg={4} md={1}>
                    <List
                        disablePadding={true}
                        sx={{ maxHeight: '400px', overflow: 'auto' }}
                    >
                        {projects.map((project) => {
                            return (
                                <ListItem
                                    key={project.name}
                                    disablePadding={true}
                                    sx={{ mb: 1 }}
                                >
                                    <ListItemButton
                                        sx={projectStyle}
                                        selected={
                                            project.name === activeProject
                                        }
                                        onClick={() =>
                                            setActiveProject(project.name)
                                        }
                                    >
                                        <ProjectBox>
                                            <ProjectIcon color='primary' />
                                            <StyledCardTitle>
                                                {project.name}
                                            </StyledCardTitle>
                                            <IconButton
                                                component={Link}
                                                href={`projects/${project.name}`}
                                                size='small'
                                                sx={{ ml: 'auto' }}
                                            >
                                                <LinkIcon
                                                    titleAccess={`projects/${project.name}`}
                                                />
                                            </IconButton>
                                        </ProjectBox>
                                        {project.name === activeProject ? (
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
                    {onboardingCompleted ? (
                        <ProjectSetupComplete project={activeProject} />
                    ) : activeProject ? (
                        <CreateFlag project={activeProject} />
                    ) : null}
                </SpacedGridItem>
                <SpacedGridItem item lg={4} md={1}>
                    {activeProject ? (
                        <ConnectSDK project={activeProject} />
                    ) : null}
                </SpacedGridItem>
                <SpacedGridItem item lg={4} md={1} />
                <SpacedGridItem
                    item
                    lg={8}
                    md={1}
                    sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
                >
                    <span>Your roles in this project:</span>{' '}
                    <Badge color='secondary'>Member</Badge>{' '}
                    <Badge color='secondary'>Another</Badge>
                </SpacedGridItem>
            </ContentGrid>
            <ContentGrid container columns={{ lg: 12, md: 1 }} sx={{ mt: 2 }}>
                <SpacedGridItem item lg={4} md={1}>
                    <Typography variant='h3'>My feature flags</Typography>
                </SpacedGridItem>
                <SpacedGridItem item lg={8} md={1} />
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
                open={welcomeDialog !== 'seen'}
                onClose={() => setWelcomeDialog('seen')}
            />
        </div>
    );
};
