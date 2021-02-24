/* eslint-disable no-alert */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'react-mdl';
import { formatFullDateTimeWithLocale } from '../../../component/common/util';
import AddUser from './add-user-component';
import ChangePassword from './change-password-component';
import UpdateUser from './update-user-component';
import { showPermissions } from './util';

function UsersList({
    fetchUsers,
    removeUser,
    addUser,
    updateUser,
    changePassword,
    users,
    location,
    hasPermission,
    validatePassword,
}) {
    const [showDialog, setDialog] = useState(false);
    const [pwDialog, setPwDiaog] = useState({ open: false });
    const [updateDialog, setUpdateDiaog] = useState({ open: false });
    const openDialog = e => {
        e.preventDefault();
        setDialog(true);
    };

    const closeDialog = () => {
        setDialog(false);
    };

    const onDelete = user => e => {
        e.preventDefault();
        const doIt = confirm(`Are you sure you want to delete ${user.username || user.email}?`);
        if (doIt) {
            removeUser(user);
        }
    };

    const openPwDialog = user => e => {
        e.preventDefault();
        setPwDiaog({ open: true, user });
    };

    const closePwDialog = () => {
        setPwDiaog({ open: false });
    };

    const openUpdateDialog = user => e => {
        e.preventDefault();
        setUpdateDiaog({ open: true, user });
    };

    const closeUpdateDialog = () => {
        setUpdateDiaog({ open: false });
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div>
            <table className="mdl-data-table mdl-shadow--2dp">
                <thead>
                    <tr>
                        <th className="mdl-data-table__cell--non-numeric">Id</th>
                        <th className="mdl-data-table__cell--non-numeric">Created</th>
                        <th className="mdl-data-table__cell--non-numeric">Username</th>
                        <th className="mdl-data-table__cell--non-numeric">Name</th>
                        <th className="mdl-data-table__cell--non-numeric">Access</th>
                        <th className="mdl-data-table__cell--non-numeric">{hasPermission('ADMIN') ? 'Action' : ''}</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(item => (
                        <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{formatFullDateTimeWithLocale(item.createdAt, location.locale)}</td>
                            <td style={{ textAlign: 'left' }}>{item.username || item.email}</td>
                            <td style={{ textAlign: 'left' }}>{item.name}</td>
                            <td>{showPermissions(item.permissions)}</td>
                            {hasPermission('ADMIN') ? (
                                <td>
                                    <a href="" title="Edit" onClick={openUpdateDialog(item)}>
                                        <Icon name="edit" />
                                    </a>
                                    <a href="" title="Change password" onClick={openPwDialog(item)}>
                                        <Icon name="lock" />
                                    </a>
                                    <a href="" title="Remove user" onClick={onDelete(item)}>
                                        <Icon name="delete" />
                                    </a>
                                </td>
                            ) : (
                                <td>
                                    <a href="" title="Change password" onClick={openPwDialog(item)}>
                                        <Icon name="lock" />
                                    </a>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
            <br />
            <a href="" onClick={openDialog}>
                Add new user
            </a>
            <AddUser
                showDialog={showDialog}
                closeDialog={closeDialog}
                addUser={addUser}
                validatePassword={validatePassword}
            />
            <UpdateUser
                showDialog={updateDialog.open}
                closeDialog={closeUpdateDialog}
                updateUser={updateUser}
                user={updateDialog.user}
            />
            <ChangePassword
                showDialog={pwDialog.open}
                closeDialog={closePwDialog}
                changePassword={changePassword}
                validatePassword={validatePassword}
                user={pwDialog.user}
            />
        </div>
    );
}

UsersList.propTypes = {
    users: PropTypes.array.isRequired,
    fetchUsers: PropTypes.func.isRequired,
    removeUser: PropTypes.func.isRequired,
    addUser: PropTypes.func.isRequired,
    hasPermission: PropTypes.func.isRequired,
    validatePassword: PropTypes.func.isRequired,
    updateUser: PropTypes.func.isRequired,
    changePassword: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
};

export default UsersList;
