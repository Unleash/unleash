import React from 'react';
import Dialogue from '../../common/Dialogue/Dialogue';
import ConditionallyRender from '../../common/ConditionallyRender/ConditionallyRender';
import propTypes from 'prop-types';
import { REMOVE_USER_ERROR } from '../../../hooks/api/actions/useAdminUsersApi/useAdminUsersApi';
import { Alert } from '@material-ui/lab';
import useLoading from '../../../hooks/useLoading';
import { Avatar, Typography } from '@material-ui/core';
import { useCommonStyles } from '../../../common.styles';

const DelUserComponent = ({
    showDialog,
    closeDialog,
    user,
    userLoading,
    removeUser,
    userApiErrors,
}) => {
    const ref = useLoading(userLoading);
    const commonStyles = useCommonStyles();

    return (
        <Dialogue
            open={showDialog}
            title="Really delete user?"
            onClose={closeDialog}
            onClick={() => removeUser(user)}
            primaryButtonText="Delete user"
            secondaryButtonText="Cancel"
        >
            <div ref={ref}>
                <ConditionallyRender
                    condition={userApiErrors[REMOVE_USER_ERROR]}
                    show={
                        <Alert
                            data-loading
                            severity="error"
                            style={{ margin: '1rem 0' }}
                        >
                            {userApiErrors[REMOVE_USER_ERROR]}
                        </Alert>
                    }
                />
                <div data-loading className={commonStyles.flexRow}>
                    <Avatar
                        variant="rounded"
                        alt={user.name}
                        src={user.imageUrl}
                        title={`${
                            user.name || user.email || user.username
                        } (id: ${user.id})`}
                    />
                    <Typography
                        variant="subtitle1"
                        style={{ marginLeft: '1rem' }}
                    >
                        {user.username || user.email}
                    </Typography>
                </div>
                <Typography
                    data-loading
                    variant="body1"
                    style={{ marginTop: '1rem' }}
                >
                    Are you sure you want to delete{' '}
                    {user
                        ? `${user.name || 'user'} (${
                              user.email || user.username
                          })`
                        : ''}
                    ?
                </Typography>
            </div>
        </Dialogue>
    );
};

DelUserComponent.propTypes = {
    showDialog: propTypes.bool.isRequired,
    closeDialog: propTypes.func.isRequired,
    user: propTypes.object,
    removeUser: propTypes.func.isRequired,
};

export default DelUserComponent;
