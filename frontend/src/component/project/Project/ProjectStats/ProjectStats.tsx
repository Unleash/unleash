import { Box, styled, Typography } from '@mui/material';
import { ProjectStatsSchema } from 'openapi/models';
import { HelpPopper } from './HelpPopper';
import { StatusBox } from './StatusBox';

const StyledBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(0, 0, 2, 2),
    display: 'grid',
    gap: theme.spacing(2),
    gridTemplateColumns: 'repeat(4, 1fr)',
    flexWrap: 'wrap',
    [theme.breakpoints.down('lg')]: {
        gridTemplateColumns: 'repeat(2, 1fr)',
    },
    [theme.breakpoints.down('md')]: {
        padding: theme.spacing(0, 0, 2),
    },
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
    },
}));

const StyledWidget = styled(Box)(({ theme }) => ({
    position: 'relative',
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.paper,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
    [theme.breakpoints.down('lg')]: {
        padding: theme.spacing(2),
    },
}));

const StyledTimeToProductionDescription = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body2.fontSize,
    lineHeight: theme.typography.body2.lineHeight,
}));

interface IProjectStatsProps {
    stats: ProjectStatsSchema;
}

export const ProjectStats = ({ stats }: IProjectStatsProps) => {
    if (Object.keys(stats).length === 0) {
        return null;
    }

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
            <StyledWidget>
                <StatusBox
                    title="Total changes"
                    boxText={String(projectActivityCurrentWindow)}
                    change={
                        projectActivityCurrentWindow - projectActivityPastWindow
                    }
                >
                    <HelpPopper id="total-changes">
                        Sum of all configuration and state modifications in the
                        project.
                    </HelpPopper>
                </StatusBox>
            </StyledWidget>
            <StyledWidget>
                <StatusBox
                    title="Avg. time to production"
                    boxText={
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: theme => theme.spacing(1),
                            }}
                        >
                            {avgTimeToProdCurrentWindow}{' '}
                            <Typography component="span">days</Typography>
                        </Box>
                    }
                    customChangeElement={
                        <StyledTimeToProductionDescription>
                            In project life
                        </StyledTimeToProductionDescription>
                    }
                    percentage
                >
                    <HelpPopper id="avg-time-to-prod">
                        How long did it take on average from a feature toggle
                        was created until it was enabled in an environment of
                        type production. This is calculated only from feature
                        toggles with the type of "release".
                    </HelpPopper>
                </StatusBox>
            </StyledWidget>
            <StyledWidget>
                <StatusBox
                    title="Features created"
                    boxText={String(createdCurrentWindow)}
                    change={createdCurrentWindow - createdPastWindow}
                />
            </StyledWidget>
            <StyledWidget>
                <StatusBox
                    title="Features archived"
                    boxText={String(archivedCurrentWindow)}
                    change={archivedCurrentWindow - archivedPastWindow}
                />
            </StyledWidget>
        </StyledBox>
    );
};
