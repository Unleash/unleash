import { styled } from '@mui/material';
import type { FC } from 'react';
import { NavLink } from 'react-router-dom';

const StyledNavLink = styled(NavLink)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    textDecoration: 'none',
    color: 'inherit',
    padding: theme.spacing(0, 5),
    '&.active': {
        fontWeight: 'bold',
    },
}));

export const CenteredNavLink: FC<{
    to: string;
    children?: React.ReactNode;
}> = ({ to, children }) => {
    return <StyledNavLink to={to}>{children}</StyledNavLink>;
};
