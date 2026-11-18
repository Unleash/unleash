import { type FC, useId, useState } from 'react';
import { Menu, MenuItem, styled, type Theme } from '@mui/material';
import { Link as RouterLink } from 'react-router';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';
import { Truncator } from 'component/common/Truncator/Truncator';
import { ThemeSubmenu } from 'component/user/UserProfile/ThemeSubmenu/ThemeSubmenu';
import { LogOutMenuItem } from 'component/user/UserProfile/LogOutMenuItem/LogOutMenuItem';
import { PRIVACY_POLICY_URL } from 'constants/links';
import { SidebarMenuButton } from './SidebarMenuButton.tsx';

const menuPaperSx = (theme: Theme) => ({
    padding: theme.spacing(0.75),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: `${theme.shape.borderRadiusMedium}px`,
});

const menuItemSx = (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    minHeight: 'auto',
    padding: theme.spacing(1, 1.25),
    borderRadius: `${theme.shape.borderRadius}px`,
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
    lineHeight: '20px',
});

const StyledHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.25),
    padding: theme.spacing(1, 1.25),
}));

const StyledUserAvatar = styled(UserAvatar)(({ theme }) => ({
    width: theme.spacing(4),
    height: theme.spacing(4),
    margin: 0,
}));

const StyledIdentity = styled('div')({
    minWidth: 0,
});

const StyledName = styled(Truncator)(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
    lineHeight: '20px',
}));

const StyledEmail = styled(Truncator)(({ theme }) => ({
    fontSize: theme.typography.caption.fontSize,
    lineHeight: '16px',
    color: theme.palette.text.secondary,
}));

const StyledOpenInNew = styled(OpenInNewIcon)(({ theme }) => ({
    fontSize: theme.spacing(2),
    color: theme.palette.text.secondary,
}));

export const SettingsMenu: FC = () => {
    const { user } = useAuthUser();
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const menuId = useId();
    const open = Boolean(anchorEl);
    const close = () => setAnchorEl(null);

    const displayName = user?.name || user?.username;

    return (
        <>
            <SidebarMenuButton
                icon={<SettingsOutlinedIcon />}
                label='Settings'
                open={open}
                menuId={menuId}
                onClick={(event) => setAnchorEl(event.currentTarget)}
            />
            <Menu
                id={menuId}
                anchorEl={anchorEl}
                open={open}
                onClose={close}
                anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                marginThreshold={8}
                slotProps={{
                    paper: {
                        sx: [
                            menuPaperSx,
                            (theme) => ({
                                minWidth: theme.spacing(32),
                                marginTop: theme.spacing(-0.5),
                            }),
                        ],
                    },
                    list: { 'aria-label': 'Settings', sx: { padding: 0 } },
                }}
            >
                {user ? (
                    <StyledHeader>
                        <StyledUserAvatar user={user} disableTooltip />
                        <StyledIdentity>
                            <StyledName title={displayName}>
                                {displayName}
                            </StyledName>
                            {user.email ? (
                                <StyledEmail title={user.email}>
                                    {user.email}
                                </StyledEmail>
                            ) : null}
                        </StyledIdentity>
                    </StyledHeader>
                ) : null}
                <MenuItem
                    component={RouterLink}
                    to='/profile'
                    onClick={close}
                    sx={menuItemSx}
                >
                    Profile settings
                </MenuItem>
                <ThemeSubmenu
                    onCloseAll={close}
                    itemSx={menuItemSx}
                    paperSx={menuPaperSx}
                    trailing='current-mode'
                />
                <MenuItem
                    component='a'
                    href={PRIVACY_POLICY_URL}
                    rel='noopener noreferrer'
                    target='_blank'
                    onClick={close}
                    sx={menuItemSx}
                >
                    Privacy policy
                    <StyledOpenInNew />
                </MenuItem>
                <LogOutMenuItem sx={menuItemSx} />
            </Menu>
        </>
    );
};
