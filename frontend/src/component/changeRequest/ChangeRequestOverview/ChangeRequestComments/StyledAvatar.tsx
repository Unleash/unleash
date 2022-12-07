import { Avatar, styled } from '@mui/material';

export const StyledAvatar = styled(Avatar)(({ theme }) => ({
    height: '32px',
    width: '32px',
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(2),
}));
