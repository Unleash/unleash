import { styled } from '@mui/material';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';

export const StyledAvatar = styled(UserAvatar)(({ theme }) => ({
    height: '32px',
    width: '32px',
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(2),
}));
