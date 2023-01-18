import { Box, styled } from '@mui/material';
import { StatusBox } from './StatusBox';

const StyledBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(0, 0, 2, 2),
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
}));

export const ProjectStatus = () => {
    return (
        <StyledBox>
            <StatusBox title="Total changes" boxText={'86'} change={-24} />
            <StatusBox
                title="Total changes"
                boxText={'6 days'}
                change={-12}
            />{' '}
            <StatusBox title="Total changes" boxText={'86'} change={-24} />
            <StatusBox title="Total changes" boxText={'86'} change={-24} />
        </StyledBox>
    );
};
