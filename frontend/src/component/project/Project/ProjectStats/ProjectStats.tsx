import { Box, styled } from '@mui/material';
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
    stats: any; // awaiting type generation
}

export const ProjectStats = ({ stats }: IProjectStatsProps) => {
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
                boxText={projectActivityCurrentWindow}
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
                boxText={createdCurrentWindow}
                change={createdCurrentWindow - createdPastWindow}
            />
            <StatusBox
                title="Features archived"
                boxText={archivedCurrentWindow}
                change={archivedCurrentWindow - archivedPastWindow}
            />
        </StyledBox>
    );
};
