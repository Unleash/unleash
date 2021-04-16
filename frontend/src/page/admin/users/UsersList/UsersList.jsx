/* eslint-disable no-alert */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Avatar } from '@material-ui/core';
import { formatDateWithLocale } from '../../../../component/common/util';
import AddUser from '../add-user-component';
import ChangePassword from '../change-password-component';
import UpdateUser from '../update-user-component';
import DelUser from '../del-user-component';
import ConditionallyRender from '../../../../component/common/ConditionallyRender/ConditionallyRender';

function UsersList({
    roles,
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
    const [pwDialog, setPwDialog] = useState({ open: false });
    const [delDialog, setDelDialog] = useState(false);
    const [delUser, setDelUser] = useState();
    const [updateDialog, setUpdateDialog] = useState({ open: false });
    const openDialog = e => {
        e.preventDefault();
        setDialog(true);
    };

    const closeDialog = () => {
        setDialog(false);
    };

    const closeDelDialog = () => {
        setDelDialog(false);
        setDelUser(undefined);
    };

    const openDelDialog = user => e => {
        e.preventDefault();
        setDelDialog(true);
        setDelUser(user);
    };
    const openPwDialog = user => e => {
        e.preventDefault();
        setPwDialog({ open: true, user });
    };

    const closePwDialog = () => {
        setPwDialog({ open: false });
    };

    const openUpdateDialog = user => e => {
        e.preventDefault();
        setUpdateDialog({ open: true, user });
    };

    const closeUpdateDialog = () => {
        setUpdateDialog({ open: false });
    };

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const renderRole = roleId => {
        const role = roles.find(r => r.id === roleId);
        return role ? role.name : '';
    }

    return (
        <div>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell></TableCell>
                        <TableCell>Created</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Username</TableCell>
                        <TableCell align="center">Role</TableCell>
                        <TableCell align="right">{hasPermission('ADMIN') ? 'Action' : ''}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {users.map(item => (
                        <TableRow key={item.id}>
                            <TableCell><Avatar variant="rounded" alt={item.name} src={item.imageUrl} title={`${item.name || item.email || item.username} (id: ${item.id})`} /></TableCell>
                            <TableCell>{formatDateWithLocale(item.createdAt, location.locale)}</TableCell>
                            <TableCell style={{ textAlign: 'left' }}>{item.name}</TableCell>
                            <TableCell style={{ textAlign: 'left' }}>{item.username || item.email}</TableCell>
                            <TableCell align="center">{renderRole(item.rootRole)}</TableCell>
                            <ConditionallyRender
                                condition={hasPermission('ADMIN')}
                                show={
                                    <TableCell align="right">
                                        <IconButton aria-label="Edit" title="Edit" onClick={openUpdateDialog(item)}>
                                            <Icon>edit</Icon>
                                        </IconButton>
                                        <IconButton aria-label="Change password" title="Change password" onClick={openPwDialog(item)}>
                                            <Icon>lock</Icon>
                                        </IconButton>
                                        <IconButton aria-label="Remove user" title="Remove user" onClick={openDelDialog(item)}>
                                            <Icon>delete</Icon>
                                        </IconButton>
                                    </TableCell>
                                }
                                elseShow={<TableCell />}
                            />
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <br />
            <ConditionallyRender
                condition={hasPermission('ADMIN')}
                show={
                    <Button variant="contained" color="primary" onClick={openDialog}>
                        Add new user
                    </Button>
                }
                elseShow={<small>PS! Only admins can add/remove users.</small>}
            />

            <AddUser
                showDialog={showDialog}
                closeDialog={closeDialog}
                addUser={addUser}
                validatePassword={validatePassword}
                roles={roles}
            />
            {updateDialog.open && <UpdateUser
                showDialog={updateDialog.open}
                closeDialog={closeUpdateDialog}
                updateUser={updateUser}
                user={updateDialog.user}
                roles={roles}
            />}
            <ChangePassword
                showDialog={pwDialog.open}
                closeDialog={closePwDialog}
                changePassword={changePassword}
                validatePassword={validatePassword}
                user={pwDialog.user}
            />
            {delUser && (
                <DelUser
                    showDialog={delDialog}
                    closeDialog={closeDelDialog}
                    user={delUser}
                    removeUser={() => {
                        removeUser(delUser);
                        closeDelDialog();
                    }}
                />
            )}
        </div>
    );
}

UsersList.propTypes = {
    roles: PropTypes.array.isRequired,
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
