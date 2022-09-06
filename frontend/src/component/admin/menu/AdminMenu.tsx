import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Paper, Tab, Tabs, Theme } from '@mui/material';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';
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

function AdminMenu() {
    const { uiConfig } = useUiConfig();
    const theme = useTheme();
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
            <Tabs
                value={pathname}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
            >
                <Tab
                    value="/admin/users"
                    label={
                        <NavLink
                            to="/admin/users"
                            style={({ isActive }) =>
                                createNavLinkStyle({ isActive, theme })
                            }
                        >
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
                                style={({ isActive }) =>
                                    createNavLinkStyle({ isActive, theme })
                                }
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
                                style={({ isActive }) =>
                                    createNavLinkStyle({ isActive, theme })
                                }
                            >
                                <span>Project roles</span>
                            </NavLink>
                        }
                    />
                )}
                <Tab
                    value="/admin/api"
                    label={
                        <NavLink
                            to="/admin/api"
                            style={({ isActive }) =>
                                createNavLinkStyle({ isActive, theme })
                            }
                        >
                            API access
                        </NavLink>
                    }
                />
                {uiConfig.flags.embedProxyFrontend && (
                    <Tab
                        value="/admin/cors"
                        label={
                            <NavLink
                                to="/admin/cors"
                                style={({ isActive }) =>
                                    createNavLinkStyle({ isActive, theme })
                                }
                            >
                                CORS origins
                            </NavLink>
                        }
                    />
                )}
                <Tab
                    value="/admin/auth"
                    label={
                        <NavLink
                            to="/admin/auth"
                            style={({ isActive }) =>
                                createNavLinkStyle({ isActive, theme })
                            }
                        >
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
                                style={({ isActive }) =>
                                    createNavLinkStyle({ isActive, theme })
                                }
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
