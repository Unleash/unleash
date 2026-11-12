import type { FC, ReactNode } from 'react';
import { styled } from '@mui/material';
import { Link } from 'react-router';
import { SidebarItemIcon, sidebarItemStyles } from './SidebarItem.styles.ts';

const StyledLink = styled(Link)(({ theme }) => sidebarItemStyles(theme));

export const SidebarLink: FC<{
    to: string;
    icon: ReactNode;
    label: string;
}> = ({ to, icon, label }) => (
    <StyledLink to={to}>
        <SidebarItemIcon>{icon}</SidebarItemIcon>
        {label}
    </StyledLink>
);
