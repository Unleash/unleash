/* eslint-disable no-alert */
import React, { useContext, useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from '@mui/material';
import classnames from 'classnames';
import ChangePassword from './ChangePassword/ChangePassword';
import DeleteUser from './DeleteUser/DeleteUser';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import AccessContext from 'contexts/AccessContext';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import ConfirmUserAdded from '../ConfirmUserAdded/ConfirmUserAdded';
import useUsers from 'hooks/api/getters/useUsers/useUsers';
import useAdminUsersApi from 'hooks/api/actions/useAdminUsersApi/useAdminUsersApi';
import UserListItem from './UserListItem/UserListItem';
import loadingData from './loadingData';
import useLoading from 'hooks/useLoading';
import usePagination from 'hooks/usePagination';
import PaginateUI from 'component/common/PaginateUI/PaginateUI';
import { IUser } from 'interfaces/user';
import IRole from 'interfaces/role';
import useToast from 'hooks/useToast';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useUsersFilter } from 'hooks/useUsersFilter';
import { useUsersSort } from 'hooks/useUsersSort';
import { TableCellSortable } from 'component/common/Table/TableCellSortable/TableCellSortable';
import { useStyles } from './UserListItem/UserListItem.styles';
import { useUsersPlan } from 'hooks/useUsersPlan';

interface IUsersListProps {
    search: string;
}

const UsersList = ({ search }: IUsersListProps) => {
    const { classes: styles } = useStyles();
    const { users, roles, refetch, loading } = useUsers();
    const { setToastData, setToastApiError } = useToast();
    const { removeUser, changePassword, userLoading, userApiErrors } =
        useAdminUsersApi();
    const { hasAccess } = useContext(AccessContext);
    const { locationSettings } = useLocationSettings();
    const [pwDialog, setPwDialog] = useState<{ open: boolean; user?: IUser }>({
        open: false,
    });
    const [delDialog, setDelDialog] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [inviteLink, setInviteLink] = useState('');
    const [delUser, setDelUser] = useState<IUser>();
    const ref = useLoading(loading);
    const { planUsers, isBillingUsers } = useUsersPlan(users);
    const { filtered, setFilter } = useUsersFilter(planUsers);
    const { sorted, sort, setSort } = useUsersSort(filtered);

    const filterUsersByQueryPage = (user: IUser) => {
        const fieldsToSearch = [
            user.name ?? '',
            user.username ?? user.email ?? '',
        ];

        return fieldsToSearch.some(field => {
            return field.toLowerCase().includes(search.toLowerCase());
        });
    };
    // Filter users and reset pagination page when search is triggered
    const { page, pages, nextPage, prevPage, setPageIndex, pageIndex } =
        usePagination(sorted, 50, filterUsersByQueryPage);

    useEffect(() => {
        setFilter(filter => ({ ...filter, query: search }));
    }, [search, setFilter]);

    const closeDelDialog = () => {
        setDelDialog(false);
        setDelUser(undefined);
    };

    const openDelDialog =
        (user: IUser) => (e: React.SyntheticEvent<Element, Event>) => {
            e.preventDefault();
            setDelDialog(true);
            setDelUser(user);
        };
    const openPwDialog =
        (user: IUser) => (e: React.SyntheticEvent<Element, Event>) => {
            e.preventDefault();
            setPwDialog({ open: true, user });
        };

    const closePwDialog = () => {
        setPwDialog({ open: false });
    };

    const onDeleteUser = async (user: IUser) => {
        try {
            await removeUser(user.id);
            setToastData({
                title: `${user.name} has been deleted`,
                type: 'success',
            });
            refetch();
            closeDelDialog();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

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
                    locationSettings={locationSettings}
                    renderRole={renderRole}
                    search={search}
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
                    locationSettings={locationSettings}
                    renderRole={renderRole}
                    search={search}
                    isBillingUsers={isBillingUsers}
                />
            );
        });
    };

    if (!users) return null;

    return (
        <div ref={ref}>
            <Table>
                <TableHead>
                    <TableRow className={styles.tableCellHeader}>
                        <ConditionallyRender
                            condition={isBillingUsers}
                            show={
                                <TableCell
                                    align="center"
                                    className={classnames(styles.hideSM)}
                                >
                                    Type
                                </TableCell>
                            }
                        />
                        <TableCellSortable
                            className={classnames(
                                styles.hideSM,
                                styles.shrinkTableCell
                            )}
                            name="created"
                            sort={sort}
                            setSort={setSort}
                        >
                            Created
                        </TableCellSortable>
                        <TableCell
                            align="center"
                            className={classnames(
                                styles.hideXS,
                                styles.firstColumnSM
                            )}
                        >
                            Avatar
                        </TableCell>
                        <TableCellSortable
                            name="name"
                            sort={sort}
                            className={classnames(styles.firstColumnXS)}
                            setSort={setSort}
                        >
                            Name
                        </TableCellSortable>
                        <TableCell className={styles.hideSM}>
                            Username
                        </TableCell>
                        <TableCellSortable
                            className={classnames(
                                styles.hideXS,
                                styles.shrinkTableCell
                            )}
                            name="role"
                            sort={sort}
                            setSort={setSort}
                        >
                            Role
                        </TableCellSortable>
                        <TableCellSortable
                            className={classnames(
                                styles.hideXS,
                                styles.shrinkTableCell
                            )}
                            name="last-seen"
                            sort={sort}
                            setSort={setSort}
                        >
                            Last login
                        </TableCellSortable>
                        <TableCell align="center">
                            {hasAccess(ADMIN) ? 'Actions' : ''}
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
            <ConditionallyRender
                condition={!pages.length && search.length > 0}
                show={
                    <p className={styles.errorMessage}>
                        There are no results for "{search}"
                    </p>
                }
            />
            <br />

            <ConfirmUserAdded
                open={showConfirm}
                closeConfirm={closeConfirm}
                emailSent={emailSent}
                inviteLink={inviteLink}
            />

            <ConditionallyRender
                condition={Boolean(pwDialog.user)}
                show={() => (
                    <ChangePassword
                        showDialog={pwDialog.open}
                        closeDialog={closePwDialog}
                        changePassword={changePassword}
                        user={pwDialog.user!}
                    />
                )}
            />
            <ConditionallyRender
                condition={Boolean(delUser)}
                show={
                    <DeleteUser
                        showDialog={delDialog}
                        closeDialog={closeDelDialog}
                        user={delUser!}
                        removeUser={() => onDeleteUser(delUser!)}
                        userLoading={userLoading}
                        userApiErrors={userApiErrors}
                    />
                }
            />
        </div>
    );
};

export default UsersList;
