import React from 'react';
import { Link } from 'react-router-dom';

function AdminMenu() {
    return (
        <div>
            <Link to="/admin/users">Users</Link> | <Link to="/admin/api">API Access</Link> |{' '}
            <Link to="/admin/auth">Authentication</Link>
        </div>
    );
}

export default AdminMenu;
