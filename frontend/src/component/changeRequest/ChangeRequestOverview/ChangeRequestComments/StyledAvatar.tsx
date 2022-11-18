import { Avatar, styled } from '@mui/material';

export const StyledAvatar = styled(Avatar)(({ theme }) => ({
    height: '30px',
    width: '30px',
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(2),
}));
