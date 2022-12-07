import { Theme } from '@mui/material';
import React, { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

const createNavLinkStyle = (props: {
    isActive: boolean;
    theme: Theme;
}): React.CSSProperties => {
    const navLinkStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        textDecoration: 'none',
        color: 'inherit',
        padding: props.theme.spacing(1.5, 3),
    };

    const activeNavLinkStyle: React.CSSProperties = {
        fontWeight: 'bold',
        borderRadius: '3px',
        padding: props.theme.spacing(1.5, 3),
    };

    return props.isActive
        ? { ...navLinkStyle, ...activeNavLinkStyle }
        : navLinkStyle;
};

export const CenteredNavLink: FC<{ to: string }> = ({ to, children }) => {
    const theme = useTheme();
    return (
        <NavLink
            to={to}
            style={({ isActive }) => createNavLinkStyle({ isActive, theme })}
        >
            {children}
        </NavLink>
    );
};
