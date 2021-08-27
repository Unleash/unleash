/* eslint-disable no-alert */
import { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from '@material-ui/core';
import AddUser from '../AddUser/AddUser';
import ChangePassword from '../change-password-component';
import UpdateUser from '../update-user-component';
import DelUser from '../del-user-component';
import ConditionallyRender from '../../../../component/common/ConditionallyRender/ConditionallyRender';
import AccessContext from '../../../../contexts/AccessContext';
import { ADMIN } from '../../../../component/AccessProvider/permissions';
import ConfirmUserAdded from '../ConfirmUserAdded/ConfirmUserAdded';
import useUsers from '../../../../hooks/api/getters/useUsers/useUsers';
import useAdminUsersApi from '../../../../hooks/api/actions/useAdminUsersApi/useAdminUsersApi';
import UserListItem from './UserListItem/UserListItem';
import loadingData from './loadingData';
import useLoading from '../../../../hooks/useLoading';
import usePagination from '../../../../hooks/usePagination';
import PaginateUI from '../../../../component/common/PaginateUI/PaginateUI';

function UsersList({ location, closeDialog, showDialog }) {
    const { users, roles, refetch, loading } = useUsers();
    const {
        addUser,
        removeUser,
        updateUser,
        changePassword,
        validatePassword,
        userLoading,
        userApiErrors,
    } = useAdminUsersApi();
    const { hasAccess } = useContext(AccessContext);
    const [pwDialog, setPwDialog] = useState({ open: false });
    const [delDialog, setDelDialog] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [inviteLink, setInviteLink] = useState('');
    const [delUser, setDelUser] = useState();
    const [updateDialog, setUpdateDialog] = useState({ open: false });
    const ref = useLoading(loading);
    const { page, pages, nextPage, prevPage, setPageIndex, pageIndex } =
        usePagination(users, 50);

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

    const onAddUser = data => {
        addUser(data)
            .then(res => res.json())
            .then(user => {
                setEmailSent(user.emailSent);
                setInviteLink(user.inviteLink);
                closeDialog();
                refetch();
                setShowConfirm(true);
            })
            .catch(handleCatch);
    };

    const onDeleteUser = () => {
        removeUser(delUser)
            .then(() => {
                refetch();
                closeDelDialog();
            })
            .catch(handleCatch);
    };

    const onUpdateUser = data => {
        updateUser(data)
            .then(() => {
                refetch();
                closeUpdateDialog();
            })
            .catch(handleCatch);
    };

    const handleCatch = () =>
        console.log('An exception was thrown and handled.');

    const closeConfirm = () => {
        setShowConfirm(false);
        setEmailSent(false);
        setInviteLink('');
    };

    const renderRole = roleId => {
        const role = roles.find(r => r.id === roleId);
        return role ? role.name : '';
    };

    const renderUsers = () => {
        if (loading) {
            return loadingData.map(user => (
                <UserListItem
                    key={user.id}
                    user={user}
                    openUpdateDialog={openUpdateDialog}
                    openPwDialog={openPwDialog}
                    openDelDialog={openDelDialog}
                    location={location}
                    renderRole={renderRole}
                />
            ));
        }

        return page.map(user => {
            return (
                <UserListItem
                    key={user.id}
                    user={user}
                    openUpdateDialog={openUpdateDialog}
                    openPwDialog={openPwDialog}
                    openDelDialog={openDelDialog}
                    location={location}
                    renderRole={renderRole}
                />
            );
        });
    };

    if (!users) return null;

    return (
        <div ref={ref}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell></TableCell>
                        <TableCell>Created</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Username</TableCell>
                        <TableCell align="center">Role</TableCell>
                        <TableCell align="right">
                            {hasAccess(ADMIN) ? 'Action' : ''}
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>{renderUsers()}</TableBody>
                <PaginateUI
                    pages={pages}
                    pageIndex={pageIndex}
                    setPageIndex={setPageIndex}
                    nextPage={nextPage}
                    prevPage={prevPage}
                />
            </Table>
            <br />

            <ConfirmUserAdded
                open={showConfirm}
                closeConfirm={closeConfirm}
                emailSent={emailSent}
                inviteLink={inviteLink}
            />

            <AddUser
                showDialog={showDialog}
                closeDialog={closeDialog}
                addUser={onAddUser}
                userLoading={userLoading}
                validatePassword={validatePassword}
                userApiErrors={userApiErrors}
                roles={roles}
            />

            <UpdateUser
                showDialog={updateDialog.open}
                closeDialog={closeUpdateDialog}
                updateUser={onUpdateUser}
                userLoading={userLoading}
                userApiErrors={userApiErrors}
                user={updateDialog.user}
                roles={roles}
            />

            <ChangePassword
                showDialog={pwDialog.open}
                closeDialog={closePwDialog}
                changePassword={changePassword}
                validatePassword={validatePassword}
                user={pwDialog.user}
            />

            <ConditionallyRender
                condition={delUser}
                show={
                    <DelUser
                        showDialog={delDialog}
                        closeDialog={closeDelDialog}
                        user={delUser}
                        removeUser={onDeleteUser}
                        userLoading={userLoading}
                        userApiErrors={userApiErrors}
                    />
                }
            />
        </div>
    );
}

UsersList.propTypes = {
    location: PropTypes.object.isRequired,
};

export default UsersList;
