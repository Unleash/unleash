import { styled } from '@mui/material';

const StyledContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(2, 0),
}));

export const ProjectMembers = () => {
    return <StyledContainer />;
};
