import { Box, styled } from '@mui/material';
import { StatusBox } from './StatusBox';

const StyledBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(0, 0, 2, 2),
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
}));

export const ProjectStatus = ({ stats }) => {
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

    const calculatePercentage = () => {};

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
                change={-12}
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
