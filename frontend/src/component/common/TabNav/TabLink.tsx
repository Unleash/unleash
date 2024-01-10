import { styled } from '@mui/material';
import { FC } from 'react';
import { Link } from 'react-router-dom';

const StyledTabLink = styled(Link)(({ theme }) => ({
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

interface ICenteredTabLinkProps {
    to: string;
}

export const TabLink: FC<ICenteredTabLinkProps> = ({ to, children }) => (
    <StyledTabLink to={to}>{children}</StyledTabLink>
);
