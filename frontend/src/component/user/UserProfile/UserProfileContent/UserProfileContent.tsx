import { Menu, MenuItem, styled } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { basePath } from 'utils/formatPath';
import OpenInNew from '@mui/icons-material/OpenInNew';
import { Link as RouterLink } from 'react-router';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';
import { Truncator } from 'component/common/Truncator/Truncator';
import type { IUser } from 'interfaces/user';

const menuItemSx: SxProps<Theme> = {
    display: 'flex',
    alignItems: 'center',
    gap: (theme) => theme.spacing(0.5),
    paddingBlock: (theme) => theme.spacing(1.5),
};

const StyledHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1, 2, 1),
}));

const StyledUserAvatar = styled(UserAvatar)(({ theme }) => ({
    width: theme.spacing(3.5),
    height: theme.spacing(3.5),
    margin: 0,
}));

const StyledTruncator = styled(Truncator)(({ theme }) => ({
    maxWidth: theme.spacing(28),
    fontSize: theme.typography.body2.fontSize,
}));

const StyledEmail = styled(StyledTruncator)(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

const StyledOpenInNew = styled(OpenInNew)(({ theme }) => ({
    fontSize: theme.spacing(2),
    color: theme.palette.text.secondary,
    alignSelf: 'flex-end',
}));

interface IUserProfileContentProps {
    id: string;
    anchorEl: HTMLElement | null;
    onClose: () => void;
    profile: IUser;
}

export const UserProfileContent = ({
    id,
    anchorEl,
    onClose,
    profile,
}: IUserProfileContentProps) => (
    <Menu
        id={id}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
            paper: {
                sx: {
                    minWidth: (theme) => theme.spacing(34),
                    borderRadius: (theme) => theme.shape.borderRadiusSmall,
                },
            },
        }}
    >
        <StyledHeader>
            <StyledUserAvatar user={profile} disableTooltip />
            <div>
                <StyledTruncator title={profile.name}>
                    {profile.name || profile.username}
                </StyledTruncator>
                <StyledEmail title={profile.email}>{profile.email}</StyledEmail>
            </div>
        </StyledHeader>

        <MenuItem
            component={RouterLink}
            to='/profile'
            onClick={onClose}
            sx={menuItemSx}
        >
            Profile settings
        </MenuItem>

        <MenuItem
            component='a'
            href='https://www.getunleash.io/privacy-policy'
            rel='noopener noreferrer'
            target='_blank'
            onClick={onClose}
            sx={menuItemSx}
        >
            Privacy policy
            <StyledOpenInNew />
        </MenuItem>

        <form method='POST' action={`${basePath}/logout`}>
            <MenuItem
                component='button'
                type='submit'
                sx={{ ...menuItemSx, width: '100%' }}
            >
                Log out
            </MenuItem>
        </form>
    </Menu>
);
