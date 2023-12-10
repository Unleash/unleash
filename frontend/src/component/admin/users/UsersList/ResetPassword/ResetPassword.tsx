import React, { useState } from 'react';
import classnames from 'classnames';
import { Box, styled, TextField, Typography } from '@mui/material';
import { modalStyles } from 'component/admin/users/util';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { useThemeStyles } from 'themes/themeStyles';
import { IUser } from 'interfaces/user';
import useAdminUsersApi from 'hooks/api/actions/useAdminUsersApi/useAdminUsersApi';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { LinkField } from '../../LinkField/LinkField';

const StyledUserAvatar = styled(UserAvatar)(({ theme }) => ({
    width: theme.spacing(5),
    height: theme.spacing(5),
    margin: 0,
}));

interface IChangePasswordProps {
    showDialog: boolean;
    closeDialog: () => void;
    user: IUser;
}

const ResetPassword = ({
    showDialog,
    closeDialog,
    user,
}: IChangePasswordProps) => {
    const { classes: themeStyles } = useThemeStyles();
    const { resetPassword } = useAdminUsersApi();
    const { setToastApiError } = useToast();
    const [resetLink, setResetLink] = useState('');

    const submit = async (event: React.SyntheticEvent) => {
        event.preventDefault();
        if (!user.email) {
            setToastApiError('User without email cannot reset password');
            return;
        }

        try {
            const token = await resetPassword(user.email).then((res) =>
                res.ok ? res.json() : undefined,
            );

            if (token) {
                console.log(token);
                setResetLink(token.resetPasswordUrl);
            } else {
                setToastApiError("Could not reset password");
            }
        } catch (error) {
            console.warn(error);
            setToastApiError(formatUnknownError(error));
        }
    };

    const onCancel = (event: React.SyntheticEvent) => {
        event.preventDefault();
        closeDialog();
    };

    const closeConfirm = () => {
        setResetLink('');
        closeDialog();
    };

    return (
        <Dialogue
            open={showDialog}
            onClick={submit}
            style={modalStyles}
            onClose={onCancel}
            primaryButtonText='Generate Link'
            title='Reset password'
            secondaryButtonText='Cancel'
            maxWidth='xs'
        >
            <form
                onSubmit={submit}
                className={classnames(
                    themeStyles.contentSpacingY,
                    themeStyles.flexColumn,
                )}
            >
                <Typography variant='subtitle1'>
                    Reseting password for user
                </Typography>
                <div className={themeStyles.flexRow}>
                    <StyledUserAvatar user={user} variant='rounded' />
                    <Typography
                        variant='subtitle1'
                        style={{ marginLeft: '1rem' }}
                    >
                        {user.username || user.email}
                    </Typography>
                </div>
            </form>

            <Dialogue
                open={Boolean(resetLink)}
                onClick={closeConfirm}
                primaryButtonText='Close'
                title='Reset password link created'
            >
                <Box>
                    <Typography variant='body1' sx={{ mb: 2 }}>
                        Using this link the user can reset the password.
                    </Typography>
                    <Typography variant='body1'>
                        Provide them with the following link to reset their
                        password. This will allow them to set up a new password
                        and get back to using their Unleash account.
                    </Typography>
                    <LinkField inviteLink={resetLink} />
                </Box>
            </Dialogue>
        </Dialogue>
    );
};

export default ResetPassword;
