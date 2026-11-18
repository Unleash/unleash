import type { FC, MouseEvent, ReactNode, Ref } from 'react';
import { ButtonBase, styled } from '@mui/material';
import { SidebarItemIcon, sidebarItemStyles } from './SidebarItem.styles.ts';

const StyledButton = styled(ButtonBase)(({ theme }) => ({
    ...sidebarItemStyles(theme),
    '&[aria-expanded="true"]': {
        backgroundColor: theme.palette.action.hover,
    },
}));

export const SidebarMenuButton: FC<{
    ref?: Ref<HTMLButtonElement>;
    icon: ReactNode;
    label: string;
    open: boolean;
    menuId?: string;
    onClick: (event: MouseEvent<HTMLElement>) => void;
}> = ({ ref, icon, label, open, menuId, onClick }) => (
    <StyledButton
        ref={ref}
        onClick={onClick}
        aria-haspopup='menu'
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
    >
        <SidebarItemIcon>{icon}</SidebarItemIcon>
        {label}
    </StyledButton>
);
