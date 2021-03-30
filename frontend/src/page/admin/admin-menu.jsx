import React from 'react';
import { NavLink } from 'react-router-dom';
import { Grid, Icon } from '@material-ui/core';
import PageContent from '../../component/common/PageContent/PageContent';

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

function AdminMenu() {
    return (
        <PageContent style={{ marginBottom: '1rem' }}>
            <Grid container justify={'center'}>
                <Grid item md={4}>
                    <NavLink to="/admin/users" activeStyle={activeNavLinkStyle} style={navLinkStyle}>
                        <Icon style={iconStyle}>supervised_user_circle</Icon>
                        Users
                    </NavLink>
                </Grid>
                <Grid item md={4}>
                    <NavLink to="/admin/api" activeStyle={activeNavLinkStyle} style={navLinkStyle}>
                        <Icon style={iconStyle}>apps</Icon>
                        API Access
                    </NavLink>
                </Grid>
                <Grid item md={4}>
                    <NavLink to="/admin/auth" activeStyle={activeNavLinkStyle} style={navLinkStyle}>
                        <Icon style={iconStyle}>lock</Icon>
                        Authentication
                    </NavLink>
                </Grid>
            </Grid>
        </PageContent>
    );
}

export default AdminMenu;
