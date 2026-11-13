import type { FC, ReactNode } from 'react';
import { styled } from '@mui/material';
import { NavLink } from 'react-router';
import { SidebarItemIcon, sidebarItemStyles } from './SidebarItem.styles.ts';

const StyledLink = styled(NavLink)(({ theme }) => sidebarItemStyles(theme));

export const SidebarLink: FC<{
    to: string;
    icon: ReactNode;
    label: string;
    end?: boolean;
}> = ({ to, icon, label, end }) => (
    <StyledLink to={to} end={end}>
        <SidebarItemIcon>{icon}</SidebarItemIcon>
        {label}
    </StyledLink>
);
