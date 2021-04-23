import { useState } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { TextField, Typography, Avatar } from '@material-ui/core';
import { trim } from '../../../component/common/util';
import { modalStyles } from './util';
import Dialogue from '../../../component/common/Dialogue/Dialogue';
import PasswordChecker from '../../../component/user/common/ResetPasswordForm/PasswordChecker/PasswordChecker';
import { useCommonStyles } from '../../../common.styles';
import PasswordMatcher from '../../../component/user/common/ResetPasswordForm/PasswordMatcher/PasswordMatcher';
import ConditionallyRender from '../../../component/common/ConditionallyRender';
import { Alert } from '@material-ui/lab';

function ChangePassword({
    showDialog,
    closeDialog,
    changePassword,
    user = {},
}) {
    const [data, setData] = useState({});
    const [error, setError] = useState({});
    const [validPassword, setValidPassword] = useState(false);
    const commonStyles = useCommonStyles();

    const updateField = e => {
        setError({});
        setData({
            ...data,
            [e.target.name]: trim(e.target.value),
        });
    };

    const submit = async e => {
        e.preventDefault();

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
            await changePassword(user, data.password);
            setData({});
            closeDialog();
        } catch (error) {
            const msg = error.message || 'Could not update password';
            setError({ general: msg });
        }
    };

    const onCancel = e => {
        e.preventDefault();
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
                    commonStyles.contentSpacingY,
                    commonStyles.flexColumn
                )}
            >
                <ConditionallyRender
                    condition={error.general}
                    show={<Alert severity="error">{error.general}</Alert>}
                />
                <Typography variant="subtitle1">
                    Changing password for user
                </Typography>
                <div className={commonStyles.flexRow}>
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
                <PasswordChecker
                    password={data.password}
                    callback={setValidPassword}
                />

                <p style={{ color: 'red' }}>{error.general}</p>
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
                    started={data.password && data.confirm}
                    matchingPasswords={data.password === data.confirm}
                />
            </form>
        </Dialogue>
    );
}

ChangePassword.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    closeDialog: PropTypes.func.isRequired,
    changePassword: PropTypes.func.isRequired,
    validatePassword: PropTypes.func.isRequired,
    user: PropTypes.object,
};

export default ChangePassword;
