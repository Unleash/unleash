import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Paper, Tab, Tabs } from '@material-ui/core';
import useUiConfig from '../../../hooks/api/getters/useUiConfig/useUiConfig';

const navLinkStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    textDecoration: 'none',
    color: 'inherit',
    padding: '0.8rem 1.5rem',
};

const activeNavLinkStyle: React.CSSProperties = {
    fontWeight: 'bold',
    borderRadius: '3px',
    padding: '0.8rem 1.5rem',
};

function AdminMenu() {
    const { uiConfig } = useUiConfig();
    const { pathname } = useLocation();
    const { flags } = uiConfig;

    return (
        <Paper
            style={{
                marginBottom: '1rem',
                borderRadius: '12.5px',
                boxShadow: 'none',
            }}
        >
            <Tabs centered value={pathname}>
                <Tab
                    value="/admin/users"
                    label={
                        <NavLink
                            to="/admin/users"
                            activeStyle={activeNavLinkStyle}
                            style={navLinkStyle}
                        >
                            <span>Users</span>
                        </NavLink>
                    }
                />
                {flags.RE && (
                    <Tab
                        value="/admin/roles"
                        label={
                            <NavLink
                                to="/admin/roles"
                                activeStyle={activeNavLinkStyle}
                                style={navLinkStyle}
                            >
                                <span>PROJECT ROLES</span>
                            </NavLink>
                        }
                    />
                )}

                <Tab
                    value="/admin/api"
                    label={
                        <NavLink
                            to="/admin/api"
                            activeStyle={activeNavLinkStyle}
                            style={navLinkStyle}
                        >
                            API Access
                        </NavLink>
                    }
                />
                <Tab
                    value="/admin/auth"
                    label={
                        <NavLink
                            to="/admin/auth"
                            activeStyle={activeNavLinkStyle}
                            style={navLinkStyle}
                        >
                            Single Sign-On
                        </NavLink>
                    }
                />
            </Tabs>
        </Paper>
    );
}

export default AdminMenu;
