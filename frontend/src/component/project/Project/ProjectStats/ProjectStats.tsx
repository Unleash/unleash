import { Box, styled, Typography } from '@mui/material';
import { ProjectStatsSchema } from 'openapi/models';
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

interface IProjectStatsProps {
    stats: ProjectStatsSchema;
}

export const ProjectStats = ({ stats }: IProjectStatsProps) => {
    if (Object.keys(stats).length === 0) {
        return null;
    }

    const {
        avgTimeToProdCurrentWindow,
        avgTimeToProdPastWindow,
        projectActivityCurrentWindow,
        projectActivityPastWindow,
        createdCurrentWindow,
        createdPastWindow,
        archivedCurrentWindow,
        archivedPastWindow,
    } = stats;

    const calculatePercentage = (partial: number, total: number) => {
        const percentage = (partial * 100) / total;

        if (Number.isInteger(percentage)) {
            return percentage;
        }
        return 0;
    };

    return (
        <StyledBox>
            <StyledWidget>
                <StatusBox
                    title="Total changes"
                    boxText={String(projectActivityCurrentWindow)}
                    change={
                        projectActivityCurrentWindow -
                        projectActivityPastWindow -
                        20
                    }
                />
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
                    change={calculatePercentage(
                        avgTimeToProdCurrentWindow,
                        avgTimeToProdPastWindow
                    )}
                    percentage
                />
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
