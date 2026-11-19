import { type FC, type ReactNode, useContext, useId, useState } from 'react';
import {
    Divider,
    ListItemIcon,
    Menu,
    MenuItem,
    styled,
    type Theme,
} from '@mui/material';
import { Link as RouterLink } from 'react-router';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import DomainOutlinedIcon from '@mui/icons-material/DomainOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import AccessContext from 'contexts/AccessContext';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';
import { Truncator } from 'component/common/Truncator/Truncator';
import { ThemeSubmenu } from 'component/user/UserProfile/ThemeSubmenu/ThemeSubmenu';
import { LogOutMenuItem } from 'component/user/UserProfile/LogOutMenuItem/LogOutMenuItem';
import { PRIVACY_POLICY_URL } from 'constants/links';
import { PendingAccessRequestsIndicator } from 'component/admin/users/AccessRequestsNotifications/PendingAccessRequestsIndicator';
import { SidebarPendingAccessRequestsIndicator } from './SidebarItem.styles.ts';
import { SidebarMenuButton } from './SidebarMenuButton.tsx';

const menuPaperSx = (theme: Theme) => ({
    padding: theme.spacing(0.75),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: `${theme.shape.borderRadiusMedium}px`,
});

const menuItemSx = (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.25),
    minHeight: 'auto',
    padding: theme.spacing(1, 1.25),
    borderRadius: `${theme.shape.borderRadius}px`,
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
    lineHeight: '20px',
    '& .MuiListItemIcon-root': {
        minWidth: 0,
        color: theme.palette.text.secondary,
        '& svg': {
            fontSize: theme.spacing(2.5),
        },
    },
});

const twoLineMenuItemSx = (theme: Theme) => ({
    ...menuItemSx(theme),
    alignItems: 'flex-start',
});

const dividerSx = (theme: Theme) => ({
    marginBlock: theme.spacing(0.5),
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

const StyledTwoLineLabel = styled('span')({
    display: 'flex',
    flexDirection: 'column',
});

const StyledDescription = styled('span')(({ theme }) => ({
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.fontWeightRegular,
    lineHeight: '16px',
    color: theme.palette.text.secondary,
}));

const StyledTitle = styled('span')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(0.5),
}));

const TwoLineMenuItem: FC<{
    icon: ReactNode;
    title: string;
    badge?: ReactNode;
    description: string;
    onClick: () => void;
}> = ({ icon, title, badge, description, onClick }) => {
    const id = useId();

    return (
        <MenuItem
            onClick={onClick}
            sx={twoLineMenuItemSx}
            aria-labelledby={`${id}-title`}
            aria-describedby={`${id}-description`}
        >
            <ListItemIcon>{icon}</ListItemIcon>
            <StyledTwoLineLabel>
                <StyledTitle id={`${id}-title`}>
                    {title}
                    {badge}
                </StyledTitle>
                <StyledDescription id={`${id}-description`}>
                    {description}
                </StyledDescription>
            </StyledTwoLineLabel>
        </MenuItem>
    );
};

export const SettingsMenu: FC<{
    onConfigureWorkspace: () => void;
    onAdminSettings: () => void;
}> = ({ onConfigureWorkspace, onAdminSettings }) => {
    const { user } = useAuthUser();
    const { isAdmin } = useContext(AccessContext);
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
                badge={<SidebarPendingAccessRequestsIndicator />}
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
                {user ? <Divider sx={dividerSx} /> : null}
                <MenuItem
                    component={RouterLink}
                    to='/profile'
                    onClick={close}
                    sx={menuItemSx}
                >
                    <ListItemIcon>
                        <PersonOutlinedIcon />
                    </ListItemIcon>
                    Profile settings
                </MenuItem>
                <ThemeSubmenu
                    onCloseAll={close}
                    itemSx={menuItemSx}
                    paperSx={menuPaperSx}
                    trailing='current-mode'
                    icon={<DarkModeOutlinedIcon />}
                />
                <MenuItem
                    component='a'
                    href={PRIVACY_POLICY_URL}
                    rel='noopener noreferrer'
                    target='_blank'
                    onClick={close}
                    sx={menuItemSx}
                >
                    <ListItemIcon>
                        <PolicyOutlinedIcon />
                    </ListItemIcon>
                    Privacy policy
                    <StyledOpenInNew />
                </MenuItem>
                <LogOutMenuItem sx={menuItemSx} icon={<LogoutIcon />} />
                <Divider sx={dividerSx} />
                {isAdmin ? (
                    <MenuItem
                        component={RouterLink}
                        to='/admin/users'
                        onClick={close}
                        sx={menuItemSx}
                    >
                        <ListItemIcon>
                            <PersonAddOutlinedIcon />
                        </ListItemIcon>
                        Invite people
                    </MenuItem>
                ) : null}
                <TwoLineMenuItem
                    icon={<DomainOutlinedIcon />}
                    title='Configure workspace'
                    description='Settings that apply to all projects'
                    onClick={() => {
                        close();
                        onConfigureWorkspace();
                    }}
                />
                <TwoLineMenuItem
                    icon={<AdminPanelSettingsOutlinedIcon />}
                    title='Admin settings'
                    badge={<PendingAccessRequestsIndicator />}
                    description='Users, access, API tokens, security and more'
                    onClick={() => {
                        close();
                        onAdminSettings();
                    }}
                />
            </Menu>
        </>
    );
};
