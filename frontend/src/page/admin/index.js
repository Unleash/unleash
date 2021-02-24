import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Grid, Cell } from 'react-mdl';
import { Link } from 'react-router-dom';

const render = () => (
    <Grid style={{ textAlign: 'center' }}>
        <Cell col={4}>
            <Icon name="supervised_user_circle" style={{ fontSize: '5em' }} />
            <br />
            <Link to="/admin/users">Users</Link>
        </Cell>
        <Cell col={4}>
            <Icon name="apps" style={{ fontSize: '5em' }} />
            <br />
            <Link to="/admin/api">API Access</Link>
        </Cell>
        <Cell col={4}>
            <Icon name="lock" style={{ fontSize: '5em' }} />
            <br />
            <Link to="/admin/auth">Authentication</Link>
        </Cell>
    </Grid>
);

render.propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
};

export default render;
