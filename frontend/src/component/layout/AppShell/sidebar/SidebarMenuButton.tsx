import type { FC, MouseEvent, ReactNode, Ref } from 'react';
import { styled } from '@mui/material';
import { SidebarButton } from './SidebarButton.tsx';

const StyledButton = styled(SidebarButton)(({ theme }) => ({
    '&[aria-expanded="true"]': {
        backgroundColor: theme.palette.action.hover,
    },
}));

export const SidebarMenuButton: FC<{
    ref?: Ref<HTMLButtonElement>;
    icon: ReactNode;
    label: string;
    badge?: ReactNode;
    open: boolean;
    menuId?: string;
    onClick: (event: MouseEvent<HTMLElement>) => void;
}> = ({ ref, icon, label, badge, open, menuId, onClick }) => (
    <StyledButton
        ref={ref}
        icon={icon}
        label={label}
        badge={badge}
        onClick={onClick}
        aria-haspopup='menu'
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
    />
);
