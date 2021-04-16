import React from 'react';
import { NavLink } from 'react-router-dom';
import { Paper, Icon, Tabs, Tab } from '@material-ui/core';

const navLinkStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    textDecoration: 'none',
    color: 'inherit',
    padding: '0.8rem 1.5rem',
};

const activeNavLinkStyle = {
    fontWeight: 'bold',
    borderRadius: '3px',
    padding: '0.8rem 1.5rem',
};

const iconStyle = {
    marginRight: '5px',
};

function AdminMenu({history}) {
    const { location } = history;
    const { pathname } = location;
    return (
        <Paper style={{ marginBottom: '1rem' }}>
            <Tabs centered value={pathname} >
                <Tab value="/admin/users" label={
                    <NavLink to="/admin/users" activeStyle={activeNavLinkStyle} style={navLinkStyle}>
                    <Icon style={iconStyle}>supervised_user_circle</Icon>
                            <span>Users</span>
                            </NavLink>
                    }
                >
                </Tab>
                <Tab value="/admin/api" label={
                    <NavLink to="/admin/api" activeStyle={activeNavLinkStyle} style={navLinkStyle}>
                        <Icon style={iconStyle}>apps</Icon>
                        API Access
                    </NavLink>
                    }>
                </Tab>
                <Tab value="/admin/auth" label={
                    <NavLink to="/admin/auth" activeStyle={activeNavLinkStyle} style={navLinkStyle}>
                        <Icon style={iconStyle}>lock</Icon>
                        Authentication
                    </NavLink>
                    }>
                </Tab>
            </Tabs>
        </Paper>
    );
}

export default AdminMenu;
