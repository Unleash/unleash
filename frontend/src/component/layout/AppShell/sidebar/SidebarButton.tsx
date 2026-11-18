import type { ComponentProps, FC, ReactNode } from 'react';
import { ButtonBase, styled } from '@mui/material';
import { SidebarItemIcon, sidebarItemStyles } from './SidebarItem.styles.ts';

const StyledButton = styled(ButtonBase)(({ theme }) =>
    sidebarItemStyles(theme),
);

export const SidebarButton: FC<
    Omit<ComponentProps<typeof ButtonBase>, 'children'> & {
        icon: ReactNode;
        label: string;
    }
> = ({ icon, label, ...props }) => (
    <StyledButton {...props}>
        <SidebarItemIcon>{icon}</SidebarItemIcon>
        {label}
    </StyledButton>
);
