/* eslint-disable no-alert */
import React, { useContext, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from '@material-ui/core';
import ChangePassword from '../change-password-component';
import DelUser from '../del-user-component';
import ConditionallyRender from '../../../common/ConditionallyRender/ConditionallyRender';
import AccessContext from '../../../../contexts/AccessContext';
import { ADMIN } from '../../../providers/AccessProvider/permissions';
import ConfirmUserAdded from '../ConfirmUserAdded/ConfirmUserAdded';
import useUsers from '../../../../hooks/api/getters/useUsers/useUsers';
import useAdminUsersApi from '../../../../hooks/api/actions/useAdminUsersApi/useAdminUsersApi';
import UserListItem from './UserListItem/UserListItem';
import loadingData from './loadingData';
import useLoading from '../../../../hooks/useLoading';
import usePagination from '../../../../hooks/usePagination';
import PaginateUI from '../../../common/PaginateUI/PaginateUI';
import { useHistory } from 'react-router-dom';
import { IUser } from '../../../../interfaces/user';
import IRole from '../../../../interfaces/role';

const UsersList = () => {
    const { users, roles, refetch, loading } = useUsers();
    const {
        removeUser,
        changePassword,
        validatePassword,
        userLoading,
        userApiErrors,
    } = useAdminUsersApi();
    const history = useHistory();
    const { location } = history;
    const { hasAccess } = useContext(AccessContext);
    const [pwDialog, setPwDialog] = useState<{ open: boolean; user?: IUser }>({
        open: false,
    });
    const [delDialog, setDelDialog] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [inviteLink, setInviteLink] = useState('');
    const [delUser, setDelUser] = useState<IUser>();
    const ref = useLoading(loading);
    const { page, pages, nextPage, prevPage, setPageIndex, pageIndex } =
        usePagination(users, 50);

    const closeDelDialog = () => {
        setDelDialog(false);
        setDelUser(undefined);
    };

    const openDelDialog = (user: IUser) => (e: React.SyntheticEvent<Element, Event>) => {
        e.preventDefault();
        setDelDialog(true);
        setDelUser(user);
    };
    const openPwDialog = (user: IUser) => (e: React.SyntheticEvent<Element, Event>) => {
        e.preventDefault();
        setPwDialog({ open: true, user });
    };

    const closePwDialog = () => {
        setPwDialog({ open: false });
    };

    const onDeleteUser = () => {
        removeUser(delUser)
            .then(() => {
                refetch();
                closeDelDialog();
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

    const renderRole = (roleId: number) => {
        const role = roles.find((r: IRole) => r.id === roleId);
        return role ? role.name : '';
    };

    const renderUsers = () => {
        if (loading) {
            return loadingData.map(user => (
                <UserListItem
                    key={user.id}
                    user={user}
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

            <ChangePassword
                showDialog={pwDialog.open}
                closeDialog={closePwDialog}
                changePassword={changePassword}
                validatePassword={validatePassword}
                user={pwDialog.user}
            />

            <ConditionallyRender
                condition={Boolean(delUser)}
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
};

export default UsersList;
