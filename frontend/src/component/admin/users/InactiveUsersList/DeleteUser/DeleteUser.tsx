import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { REMOVE_USER_ERROR } from 'hooks/api/actions/useAdminUsersApi/useAdminUsersApi';
import { Alert } from '@mui/material';
import useLoading from 'hooks/useLoading';
import { Typography } from '@mui/material';
import { useThemeStyles } from 'themes/themeStyles';
import type { IInactiveUser } from '../../../../../hooks/api/getters/useInactiveUsers/useInactiveUsers.ts';

interface IDeleteUserProps {
    showDialog: boolean;
    closeDialog: () => void;
    user: IInactiveUser;
    userLoading: boolean;
    removeUser: () => void;
    userApiErrors: Record<string, string>;
}

const DeleteUser = ({
    showDialog,
    closeDialog,
    user,
    userLoading,
    removeUser,
    userApiErrors,
}: IDeleteUserProps) => {
    const ref = useLoading(userLoading);
    const { classes: themeStyles } = useThemeStyles();

    return (
        <Dialogue
            open={showDialog}
            title='Really delete user?'
            onClose={closeDialog}
            onClick={removeUser}
            primaryButtonText='Delete user'
            secondaryButtonText='Cancel'
        >
            <div ref={ref}>
                <ConditionallyRender
                    condition={Boolean(userApiErrors[REMOVE_USER_ERROR])}
                    show={
                        <Alert
                            data-loading
                            severity='error'
                            style={{ margin: '1rem 0' }}
                        >
                            {userApiErrors[REMOVE_USER_ERROR]}
                        </Alert>
                    }
                />
                <div data-loading className={themeStyles.flexRow}>
                    <Typography
                        variant='subtitle1'
                        style={{ marginLeft: '1rem' }}
                    >
                        {user.username || user.email}
                    </Typography>
                </div>
                <Typography
                    data-loading
                    variant='body1'
                    style={{ marginTop: '1rem' }}
                >
                    Are you sure you want to delete{' '}
                    {`${user.name || 'user'} (${user.email || user.username})`}
                </Typography>
            </div>
        </Dialogue>
    );
};

export default DeleteUser;
