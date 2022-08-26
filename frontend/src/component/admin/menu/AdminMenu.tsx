import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Paper, Tab, Tabs } from '@mui/material';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';

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

const createNavLinkStyle = (props: {
    isActive: boolean;
}): React.CSSProperties => {
    return props.isActive
        ? { ...navLinkStyle, ...activeNavLinkStyle }
        : navLinkStyle;
};

function AdminMenu() {
    const { uiConfig } = useUiConfig();
    const { pathname } = useLocation();
    const { isBilling } = useInstanceStatus();
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
                        <NavLink to="/admin/users" style={createNavLinkStyle}>
                            <span>Users</span>
                        </NavLink>
                    }
                />
                {flags.UG && (
                    <Tab
                        value="/admin/groups"
                        label={
                            <NavLink
                                to="/admin/groups"
                                style={createNavLinkStyle}
                            >
                                <span>Groups</span>
                            </NavLink>
                        }
                    />
                )}
                {flags.RE && (
                    <Tab
                        value="/admin/roles"
                        label={
                            <NavLink
                                to="/admin/roles"
                                style={createNavLinkStyle}
                            >
                                <span>Project roles</span>
                            </NavLink>
                        }
                    />
                )}
                <Tab
                    value="/admin/api"
                    label={
                        <NavLink to="/admin/api" style={createNavLinkStyle}>
                            API access
                        </NavLink>
                    }
                />
                {uiConfig.embedProxy && (
                    <Tab
                        value="/admin/cors"
                        label={
                            <NavLink
                                to="/admin/cors"
                                style={createNavLinkStyle}
                            >
                                CORS origins
                            </NavLink>
                        }
                    />
                )}
                <Tab
                    value="/admin/auth"
                    label={
                        <NavLink to="/admin/auth" style={createNavLinkStyle}>
                            Single sign-on
                        </NavLink>
                    }
                />
                {isBilling && (
                    <Tab
                        value="/admin/billing"
                        label={
                            <NavLink
                                to="/admin/billing"
                                style={createNavLinkStyle}
                            >
                                Billing
                            </NavLink>
                        }
                    />
                )}
            </Tabs>
        </Paper>
    );
}

export default AdminMenu;
