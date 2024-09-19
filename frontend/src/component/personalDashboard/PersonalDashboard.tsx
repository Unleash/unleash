import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import {
    Grid,
    Paper,
    styled,
    Typography,
    Box,
    List,
    ListItem,
    ListItemButton,
    Link,
    IconButton,
} from '@mui/material';
import type { Theme } from '@mui/material/styles/createTheme';
import { ProjectIcon } from 'component/common/ProjectIcon/ProjectIcon';
import { type FC, useState } from 'react';
import { useProfile } from 'hooks/api/getters/useProfile/useProfile';
import LinkIcon from '@mui/icons-material/Link';

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

const Projects = styled(Paper)(({ theme }) => ({
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
    boxShadow: 'none',
    padding: theme.spacing(4),
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

export const PersonalDashboard = () => {
    const { user } = useAuthUser();

    const name = user?.name;

    const myProjects = useProfile().profile?.projects || [];

    const projects = myProjects.map((project) => ({
        name: project,
        flags: 0,
        members: 1,
        health: 100,
    }));

    const [activeProject, setActiveProject] = useState<string | null>(
        projects[0]?.name,
    );

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
            <Projects>
                <Grid container spacing={2} columns={{ lg: 12 }}>
                    <Grid item lg={3}>
                        <Typography variant='h3'>My projects</Typography>
                    </Grid>
                    <Grid item lg={4} />
                    <Grid item lg={5} />
                    <Grid item lg={3}>
                        <List
                            disablePadding={true}
                            sx={{ maxHeight: '400px', overflow: 'auto' }}
                        >
                            {projects.map((project) => {
                                return (
                                    <ListItem
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
                    </Grid>
                    <Grid item lg={4}>
                        Connect an SDK
                    </Grid>
                    <Grid item lg={5}>
                        Create a feature toggle
                    </Grid>
                    <Grid item lg={3} />
                    <Grid item lg={9}>
                        Your role in this project
                    </Grid>
                </Grid>
            </Projects>
        </div>
    );
};
