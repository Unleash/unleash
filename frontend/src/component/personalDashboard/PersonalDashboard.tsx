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
} from '@mui/material';
import type { Theme } from '@mui/material/styles/createTheme';
import { ProjectIcon } from 'component/common/ProjectIcon/ProjectIcon';

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

export const PersonalDashboard = () => {
    const { user } = useAuthUser();

    const name = user?.name;

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
                        <List disablePadding={true}>
                            <ListItem disablePadding={true}>
                                <ListItemButton
                                    sx={projectStyle}
                                    selected={true}
                                >
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <ProjectIcon color='primary' /> Default
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Box>
                                            <Typography
                                                variant='subtitle2'
                                                color='primary'
                                            >
                                                0
                                            </Typography>
                                            <Typography
                                                variant='caption'
                                                color='text.secondary'
                                            >
                                                flags
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography
                                                variant='subtitle2'
                                                color='primary'
                                            >
                                                1
                                            </Typography>
                                            <Typography
                                                variant='caption'
                                                color='text.secondary'
                                            >
                                                members
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography
                                                variant='subtitle2'
                                                color='primary'
                                            >
                                                100%
                                            </Typography>
                                            <Typography
                                                variant='caption'
                                                color='text.secondary'
                                            >
                                                health
                                            </Typography>
                                        </Box>
                                    </Box>
                                </ListItemButton>
                            </ListItem>
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
