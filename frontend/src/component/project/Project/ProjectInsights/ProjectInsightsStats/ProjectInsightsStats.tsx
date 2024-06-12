import { Box, styled, Typography } from '@mui/material';
import type { ProjectStatsSchema } from 'openapi/models';
import { HelpPopper } from './HelpPopper';
import { StatusBox } from './StatusBox';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { Link } from 'react-router-dom';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'grid',
    gap: theme.spacing(2),
    gridTemplateColumns: 'repeat(4, 1fr)',
    flexWrap: 'wrap',
    [theme.breakpoints.down('lg')]: {
        gridTemplateColumns: 'repeat(2, 1fr)',
    },
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
    },
}));

const StyledTimeToProductionDescription = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body2.fontSize,
    lineHeight: theme.typography.body2.lineHeight,
}));

const NavigationBar = styled(Link)(({ theme }) => ({
    marginLeft: 'auto',
    display: 'flex',
    justifyContent: 'space-between',
    textDecoration: 'none',
    color: theme.palette.text.primary,
}));

interface IProjectStatsProps {
    stats: ProjectStatsSchema;
}

export const ProjectInsightsStats = ({ stats }: IProjectStatsProps) => {
    if (Object.keys(stats).length === 0) {
        return null;
    }
    const projectId = useRequiredPathParam('projectId');

    const {
        avgTimeToProdCurrentWindow,
        projectActivityCurrentWindow,
        projectActivityPastWindow,
        createdCurrentWindow,
        createdPastWindow,
        archivedCurrentWindow,
        archivedPastWindow,
    } = stats;

    return (
        <StyledBox>
            <StatusBox
                title='Total changes'
                boxText={String(projectActivityCurrentWindow)}
                change={
                    projectActivityCurrentWindow - projectActivityPastWindow
                }
            >
                <HelpPopper id='total-changes'>
                    Sum of all configuration and state modifications in the
                    project.
                </HelpPopper>
            </StatusBox>
            <StatusBox
                title='Avg. time to production'
                boxText={
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: (theme) => theme.spacing(1),
                        }}
                    >
                        {avgTimeToProdCurrentWindow}{' '}
                        <Typography component='span'>days</Typography>
                    </Box>
                }
                customChangeElement={
                    <StyledTimeToProductionDescription>
                        In project life
                    </StyledTimeToProductionDescription>
                }
                percentage
            >
                <HelpPopper id='avg-time-to-prod'>
                    How long did it take on average from a feature flag was
                    created until it was enabled in an environment of type
                    production. This is calculated only from feature flags with
                    the type of "release".
                </HelpPopper>
            </StatusBox>
            <StatusBox
                title='Features created'
                boxText={String(createdCurrentWindow)}
                change={createdCurrentWindow - createdPastWindow}
            >
                <NavigationBar to={`/projects/${projectId}`}>
                    <KeyboardArrowRight />
                </NavigationBar>
            </StatusBox>

            <StatusBox
                title='Features archived'
                boxText={String(archivedCurrentWindow)}
                change={archivedCurrentWindow - archivedPastWindow}
            >
                <NavigationBar to={`/projects/${projectId}/archive`}>
                    <KeyboardArrowRight />
                </NavigationBar>
            </StatusBox>
        </StyledBox>
    );
};
