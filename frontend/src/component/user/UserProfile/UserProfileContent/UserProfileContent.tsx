import { type KeyboardEvent, type MouseEvent, useState } from 'react';
import { Menu, MenuItem, styled } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { basePath } from 'utils/formatPath';
import OpenInNew from '@mui/icons-material/OpenInNew';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import Check from '@mui/icons-material/Check';
import { Link as RouterLink } from 'react-router';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';
import { Truncator } from 'component/common/Truncator/Truncator';
import { useThemeMode } from 'hooks/useThemeMode';
import type { themeMode } from 'contexts/UIContext';
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

const StyledChevron = styled(KeyboardArrowRight)(({ theme }) => ({
    marginLeft: 'auto',
    fontSize: theme.spacing(2.5),
    color: theme.palette.text.secondary,
}));

const StyledCheckSlot = styled('span')(({ theme }) => ({
    display: 'inline-flex',
    width: theme.spacing(2.5),
    color: theme.palette.primary.main,
    '& svg': {
        fontSize: theme.spacing(2),
    },
}));

const THEME_OPTIONS: { label: string; value: themeMode }[] = [
    { label: 'Dark', value: 'dark' },
    { label: 'Light', value: 'light' },
    { label: 'System', value: 'system' },
];

const ThemeSubmenu = ({ onCloseAll }: { onCloseAll: () => void }) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const { themeMode, setThemeMode } = useThemeMode();
    const open = Boolean(anchorEl);

    const openSubmenu = (event: MouseEvent<HTMLElement>) =>
        setAnchorEl(event.currentTarget);
    const closeSubmenu = () => setAnchorEl(null);

    const handleSelect = (mode: themeMode) => {
        setThemeMode(mode);
        setAnchorEl(null);
        onCloseAll();
    };

    // support keyboard accessibility by manually moving focus between the options with up/down arrows,
    // and go back to the main menu (Theme trigger) with left arrow or escape
    const handleOptionKeyDown = (event: KeyboardEvent<HTMLLIElement>) => {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            event.stopPropagation();
            const trigger = anchorEl;
            closeSubmenu();
            trigger?.focus();
            return;
        }
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        event.preventDefault();
        event.stopPropagation();
        const item = event.currentTarget;
        const parent = item.parentElement;
        if (!parent) {
            return;
        }
        const next =
            event.key === 'ArrowDown'
                ? (item.nextElementSibling ?? parent.firstElementChild)
                : (item.previousElementSibling ?? parent.lastElementChild);
        (next as HTMLElement)?.focus();
    };

    // right arrow opens the submenu (mirrors left arrow closing it)
    const handleTriggerKeyDown = (event: KeyboardEvent<HTMLLIElement>) => {
        if (event.key === 'ArrowRight') {
            event.preventDefault();
            setAnchorEl(event.currentTarget);
        }
    };

    return (
        <>
            <MenuItem
                onClick={openSubmenu}
                onMouseEnter={openSubmenu}
                onMouseLeave={closeSubmenu}
                onKeyDown={handleTriggerKeyDown}
                sx={menuItemSx}
                aria-haspopup='true'
                aria-expanded={open}
            >
                Theme
                <StyledChevron />
            </MenuItem>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={closeSubmenu}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                slotProps={{
                    root: { sx: { pointerEvents: 'none' } },
                    paper: {
                        onMouseLeave: closeSubmenu,
                        onMouseEnter: openSubmenu,
                        sx: {
                            pointerEvents: 'auto',
                            minWidth: (theme) => theme.spacing(15),
                            borderRadius: (theme) =>
                                theme.shape.borderRadiusSmall,
                        },
                    },
                }}
            >
                {THEME_OPTIONS.map((option) => (
                    <MenuItem
                        key={option.value}
                        onClick={() => handleSelect(option.value)}
                        onKeyDown={handleOptionKeyDown}
                        sx={menuItemSx}
                    >
                        <StyledCheckSlot>
                            {themeMode === option.value ? <Check /> : null}
                        </StyledCheckSlot>
                        {option.label}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};

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
                    marginTop: (theme) => theme.spacing(1),
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

        <ThemeSubmenu onCloseAll={onClose} />

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
