import { SyntheticEvent, useState } from 'react';
import { Button, TextField, Typography } from '@material-ui/core';
import classnames from 'classnames';
import { useStyles } from './EditProfile.styles';
import { useCommonStyles } from '../../../../common.styles';
import PasswordChecker from '../../common/ResetPasswordForm/PasswordChecker/PasswordChecker';
import PasswordMatcher from '../../common/ResetPasswordForm/PasswordMatcher/PasswordMatcher';
import { headers } from '../../../../store/api-helper';
import { Alert } from '@material-ui/lab';
import ConditionallyRender from '../../../common/ConditionallyRender';
import useLoading from '../../../../hooks/useLoading';
import {
    BAD_REQUEST,
    NOT_FOUND,
    OK,
    UNAUTHORIZED,
} from '../../../../constants/statusCodes';

interface IEditProfileProps {
    setEditingProfile: React.Dispatch<React.SetStateAction<boolean>>;
    setUpdatedPassword: React.Dispatch<React.SetStateAction<boolean>>;
}

const EditProfile = ({
    setEditingProfile,
    setUpdatedPassword,
}: IEditProfileProps) => {
    const styles = useStyles();
    const commonStyles = useCommonStyles();
    const [loading, setLoading] = useState(false);
    const [validPassword, setValidPassword] = useState(false);
    const [error, setError] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const ref = useLoading(loading);

    const submit = async (e: SyntheticEvent) => {
        e.preventDefault();

        if (!validPassword || password !== confirmPassword) {
            setError(
                'Password is not valid, or your passwords do not match. Please provide a password with length over 10 characters, an uppercase letter, a lowercase letter, a number and a symbol.'
            );
        } else {
            setLoading(true);
            setError('');
            try {
                const res = await fetch('api/admin/user/change-password', {
                    headers,
                    body: JSON.stringify({ password, confirmPassword }),
                    method: 'POST',
                    credentials: 'include',
                });
                handleResponse(res);
            } catch (e) {
                setError(e);
            }
        }
        setLoading(false);
    };

    const handleResponse = (res: Response) => {
        if (res.status === BAD_REQUEST) {
            setError(
                'Password could not be accepted. Please make sure you are inputting a valid password.'
            );
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
                style={{ fontWeight: 'bold' }}
                data-loading
            >
                Update password
            </Typography>
            <ConditionallyRender
                condition={Boolean(error)}
                show={
                    <Alert data-loading severity="error">
                        {error}
                    </Alert>
                }
            />
            <form
                className={classnames(
                    styles.form,
                    commonStyles.contentSpacingY
                )}
            >
                <PasswordChecker
                    password={password}
                    callback={setValidPassword}
                    data-loading
                />
                <TextField
                    data-loading
                    variant="outlined"
                    size="small"
                    label="Password"
                    type="password"
                    name="password"
                    value={password}
                    autoComplete="on"
                    onChange={e => setPassword(e.target.value)}
                />
                <TextField
                    data-loading
                    variant="outlined"
                    size="small"
                    label="Confirm password"
                    type="password"
                    name="confirmPassword"
                    value={confirmPassword}
                    autoComplete="on"
                    onChange={e => setConfirmPassword(e.target.value)}
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
