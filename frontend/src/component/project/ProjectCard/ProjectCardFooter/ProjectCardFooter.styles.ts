import { styled } from '@mui/material';
import { AvatarComponent } from 'component/common/AvatarGroup/AvatarGroup';

export const AvatarHeight = 3.5;

export const StyledWrapper = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    minHeight: theme.spacing(AvatarHeight),
}));

export const StyledContainer = styled('div')(() => ({
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '50%',
}));

export const StyledAvatarComponent = styled(AvatarComponent)(({ theme }) => ({
    cursor: 'default',
    height: theme.spacing(AvatarHeight),
}));
