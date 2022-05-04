import React, { useState } from 'react';
import classnames from 'classnames';
import { Avatar, TextField, Typography, Alert } from '@mui/material';
import { trim } from 'component/common/util';
import { modalStyles } from 'component/admin/users/util';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import PasswordChecker from 'component/user/common/ResetPasswordForm/PasswordChecker/PasswordChecker';
import { useThemeStyles } from 'themes/themeStyles';
import PasswordMatcher from 'component/user/common/ResetPasswordForm/PasswordMatcher/PasswordMatcher';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { IUser } from 'interfaces/user';

interface IChangePasswordProps {
    showDialog: boolean;
    closeDialog: () => void;
    changePassword: (userId: number, password: string) => Promise<Response>;
    user: IUser;
}

const ChangePassword = ({
    showDialog,
    closeDialog,
    changePassword,
    user,
}: IChangePasswordProps) => {
    const [data, setData] = useState<Record<string, string>>({});
    const [error, setError] = useState<Record<string, string>>({});
    const [validPassword, setValidPassword] = useState(false);
    const { classes: themeStyles } = useThemeStyles();

    const updateField: React.ChangeEventHandler<HTMLInputElement> = event => {
        setError({});
        setData({ ...data, [event.target.name]: trim(event.target.value) });
    };

    const submit = async (event: React.SyntheticEvent) => {
        event.preventDefault();

        if (!validPassword) {
            if (!data.password || data.password.length < 8) {
                setError({
                    password:
                        'You must specify a password with at least 8 chars.',
                });
                return;
            }
            if (!(data.password === data.confirm)) {
                setError({ confirm: 'Passwords does not match' });
                return;
            }
        }

        try {
            await changePassword(user.id, data.password);
            setData({});
            closeDialog();
        } catch (error: unknown) {
            const msg =
                (error instanceof Error && error.message) ||
                'Could not update password';
            setError({ general: msg });
        }
    };

    const onCancel = (event: React.SyntheticEvent) => {
        event.preventDefault();
        setData({});
        closeDialog();
    };

    return (
        <Dialogue
            open={showDialog}
            onClick={submit}
            style={modalStyles}
            onClose={onCancel}
            primaryButtonText="Save"
            title="Update password"
            secondaryButtonText="Cancel"
        >
            <form
                onSubmit={submit}
                className={classnames(
                    themeStyles.contentSpacingY,
                    themeStyles.flexColumn
                )}
            >
                <ConditionallyRender
                    condition={Boolean(error.general)}
                    show={<Alert severity="error">{error.general}</Alert>}
                />
                <Typography variant="subtitle1">
                    Changing password for user
                </Typography>
                <div className={themeStyles.flexRow}>
                    <Avatar
                        variant="rounded"
                        alt="Gravatar"
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
                <PasswordChecker
                    password={data.password}
                    callback={setValidPassword}
                />
                <TextField
                    label="New password"
                    name="password"
                    type="password"
                    value={data.password}
                    helperText={error.password}
                    onChange={updateField}
                    variant="outlined"
                    size="small"
                />
                <TextField
                    label="Confirm password"
                    name="confirm"
                    type="password"
                    value={data.confirm}
                    error={error.confirm !== undefined}
                    helperText={error.confirm}
                    onChange={updateField}
                    variant="outlined"
                    size="small"
                />
                <PasswordMatcher
                    started={Boolean(data.password && data.confirm)}
                    matchingPasswords={data.password === data.confirm}
                />
            </form>
        </Dialogue>
    );
};

export default ChangePassword;
