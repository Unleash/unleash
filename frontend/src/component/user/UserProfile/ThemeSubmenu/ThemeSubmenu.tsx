import { type KeyboardEvent, type ReactNode, useRef, useState } from 'react';
import { ListItemIcon, Menu, MenuItem, styled } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import Check from '@mui/icons-material/Check';
import { useThemeMode } from 'hooks/useThemeMode';
import type { themeMode } from 'contexts/UIContext';
import { asSxArray } from 'utils/asSxArray';

const StyledChevron = styled(KeyboardArrowRight)(({ theme }) => ({
    marginLeft: 'auto',
    fontSize: theme.spacing(2.5),
    color: theme.palette.text.secondary,
}));

const StyledCurrentMode = styled('span')(({ theme }) => ({
    marginLeft: 'auto',
    paddingLeft: theme.spacing(2),
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.fontWeightRegular,
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

interface IThemeSubmenuProps {
    onCloseAll: () => void;
    itemSx: SxProps<Theme>;
    paperSx?: SxProps<Theme>;
    trailing?: 'chevron' | 'current-mode';
    icon?: ReactNode;
}

export const ThemeSubmenu = ({
    onCloseAll,
    itemSx,
    paperSx,
    trailing = 'chevron',
    icon,
}: IThemeSubmenuProps) => {
    const triggerRef = useRef<HTMLLIElement>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const { themeMode, setThemeMode } = useThemeMode();
    const open = Boolean(anchorEl);

    const openSubmenu = () => setAnchorEl(triggerRef.current);
    const closeSubmenu = () => setAnchorEl(null);

    const handleSelect = (mode: themeMode) => {
        setThemeMode(mode);
        closeSubmenu();
        onCloseAll();
    };

    const handleOptionKeyDown = (event: KeyboardEvent<HTMLLIElement>) => {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            event.stopPropagation();
            closeSubmenu();
            triggerRef.current?.focus();
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

    const handleTriggerKeyDown = (event: KeyboardEvent<HTMLLIElement>) => {
        if (event.key === 'ArrowRight') {
            event.preventDefault();
            openSubmenu();
        }
    };

    const currentModeLabel = THEME_OPTIONS.find(
        (option) => option.value === themeMode,
    )?.label;

    return (
        <>
            <MenuItem
                ref={triggerRef}
                onClick={openSubmenu}
                onMouseEnter={openSubmenu}
                onMouseLeave={closeSubmenu}
                onKeyDown={handleTriggerKeyDown}
                sx={itemSx}
                aria-haspopup='true'
                aria-expanded={open}
            >
                {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
                Theme
                {trailing === 'current-mode' ? (
                    <StyledCurrentMode>{currentModeLabel}</StyledCurrentMode>
                ) : (
                    <StyledChevron />
                )}
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
                        sx: [
                            {
                                pointerEvents: 'auto',
                                minWidth: (theme) => theme.spacing(15),
                                borderRadius: (theme) =>
                                    theme.shape.borderRadiusSmall,
                            },
                            ...asSxArray(paperSx),
                        ],
                    },
                }}
            >
                {THEME_OPTIONS.map((option) => (
                    <MenuItem
                        key={option.value}
                        onClick={() => handleSelect(option.value)}
                        onKeyDown={handleOptionKeyDown}
                        sx={itemSx}
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
