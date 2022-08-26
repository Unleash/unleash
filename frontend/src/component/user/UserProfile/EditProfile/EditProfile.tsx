import React, { SyntheticEvent, useState } from 'react';
import { Button, Typography } from '@mui/material';
import classnames from 'classnames';
import { useStyles } from './EditProfile.styles';
import { useThemeStyles } from 'themes/themeStyles';
import PasswordChecker, {
    PASSWORD_FORMAT_MESSAGE,
} from 'component/user/common/ResetPasswordForm/PasswordChecker/PasswordChecker';
import PasswordMatcher from 'component/user/common/ResetPasswordForm/PasswordMatcher/PasswordMatcher';
import useLoading from 'hooks/useLoading';
import {
    BAD_REQUEST,
    NOT_FOUND,
    OK,
    UNAUTHORIZED,
} from 'constants/statusCodes';
import { formatApiPath } from 'utils/formatPath';
import PasswordField from 'component/common/PasswordField/PasswordField';
import { headers } from 'utils/apiUtils';
import { formatUnknownError } from 'utils/formatUnknownError';

interface IEditProfileProps {
    setEditingProfile: React.Dispatch<React.SetStateAction<boolean>>;
    setUpdatedPassword: React.Dispatch<React.SetStateAction<boolean>>;
}

const EditProfile = ({
    setEditingProfile,
    setUpdatedPassword,
}: IEditProfileProps) => {
    const { classes: styles } = useStyles();
    const { classes: themeStyles } = useThemeStyles();
    const [loading, setLoading] = useState(false);
    const [validPassword, setValidPassword] = useState(false);
    const [error, setError] = useState<string>();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const ref = useLoading(loading);

    const submit = async (e: SyntheticEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return;
        } else if (!validPassword) {
            setError(PASSWORD_FORMAT_MESSAGE);
        } else {
            setLoading(true);
            setError(undefined);
            try {
                const path = formatApiPath('api/admin/user/change-password');
                const res = await fetch(path, {
                    headers,
                    body: JSON.stringify({ password, confirmPassword }),
                    method: 'POST',
                    credentials: 'include',
                });
                handleResponse(res);
            } catch (error: unknown) {
                setError(formatUnknownError(error));
            }
        }
        setLoading(false);
    };

    const handleResponse = (res: Response) => {
        if (res.status === BAD_REQUEST) {
            setError(PASSWORD_FORMAT_MESSAGE);
        }

        if (res.status === UNAUTHORIZED) {
            setError('You are not authorized to make this request.');
        }

        if (res.status === NOT_FOUND) {
            setError(
                'The resource you requested could not be found on the server.'
            );
        }

        if (res.status === OK) {
            setEditingProfile(false);
            setUpdatedPassword(true);
        }
    };

    return (
        <div className={styles.container} ref={ref}>
            <Typography
                variant="body1"
                className={styles.editProfileTitle}
                data-loading
            >
                Update password
            </Typography>
            <form
                className={classnames(styles.form, themeStyles.contentSpacingY)}
            >
                <PasswordChecker
                    password={password}
                    callback={setValidPassword}
                    data-loading
                />
                <PasswordField
                    data-loading
                    label="Password"
                    name="password"
                    value={password}
                    error={Boolean(error)}
                    helperText={error}
                    autoComplete="new-password"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPassword(e.target.value)
                    }
                />
                <PasswordField
                    data-loading
                    label="Confirm password"
                    name="confirmPassword"
                    value={confirmPassword}
                    autoComplete="new-password"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setConfirmPassword(e.target.value)
                    }
                />
                <PasswordMatcher
                    data-loading
                    started={Boolean(password && confirmPassword)}
                    matchingPasswords={password === confirmPassword}
                />
                <Button
                    data-loading
                    variant="contained"
                    color="primary"
                    className={styles.button}
                    type="submit"
                    onClick={submit}
                >
                    Save
                </Button>
                <Button
                    data-loading
                    className={styles.button}
                    type="submit"
                    onClick={() => setEditingProfile(false)}
                >
                    Cancel
                </Button>
            </form>
        </div>
    );
};

export default EditProfile;
