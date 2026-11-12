import type { FC, ReactNode } from 'react';
import { styled } from '@mui/material';
import { Link } from 'react-router';

const StyledLink = styled(Link)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.875),
    minHeight: 28,
    padding: theme.spacing(0.25, 0.5),
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.text.primary,
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
    textDecoration: 'none',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
    '&:focus-visible': {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: -2,
    },
}));

const StyledIcon = styled('span')(({ theme }) => ({
    display: 'inline-flex',
    color: theme.palette.text.secondary,
    '& svg': {
        fontSize: theme.spacing(2.25),
    },
}));

export const SidebarLink: FC<{
    to: string;
    icon: ReactNode;
    label: string;
}> = ({ to, icon, label }) => (
    <StyledLink to={to}>
        <StyledIcon>{icon}</StyledIcon>
        {label}
    </StyledLink>
);
