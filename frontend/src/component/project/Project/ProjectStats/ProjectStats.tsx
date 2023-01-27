import { Box, styled } from '@mui/material';
import { ProjectStatsSchema } from 'openapi/models';
import { object } from 'prop-types';
import { StatusBox } from './StatusBox';

const StyledBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(0, 0, 2, 2),
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    [theme.breakpoints.down('md')]: {
        paddingLeft: 0,
    },
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
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
            <StatusBox
                title="Total changes"
                boxText={String(projectActivityCurrentWindow)}
                change={
                    projectActivityCurrentWindow - projectActivityPastWindow
                }
            />
            <StatusBox
                title="Avg. time to production"
                boxText={`${avgTimeToProdCurrentWindow} days`}
                change={calculatePercentage(
                    avgTimeToProdCurrentWindow,
                    avgTimeToProdPastWindow
                )}
                percentage
            />{' '}
            <StatusBox
                title="Features created"
                boxText={String(createdCurrentWindow)}
                change={createdCurrentWindow - createdPastWindow}
            />
            <StatusBox
                title="Features archived"
                boxText={String(archivedCurrentWindow)}
                change={archivedCurrentWindow - archivedPastWindow}
            />
        </StyledBox>
    );
};
