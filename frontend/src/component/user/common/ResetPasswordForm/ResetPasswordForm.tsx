import { Button } from '@mui/material';
import classnames from 'classnames';
import React, {
    Dispatch,
    SetStateAction,
    SyntheticEvent,
    useCallback,
    useEffect,
    useState,
} from 'react';
import { useNavigate } from 'react-router';
import { useThemeStyles } from 'themes/themeStyles';
import { OK } from 'constants/statusCodes';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import ResetPasswordError from '../ResetPasswordError/ResetPasswordError';
import PasswordChecker from './PasswordChecker/PasswordChecker';
import PasswordMatcher from './PasswordMatcher/PasswordMatcher';
import { useStyles } from './ResetPasswordForm.styles';
import { formatApiPath } from 'utils/formatPath';
import PasswordField from 'component/common/PasswordField/PasswordField';

interface IResetPasswordProps {
    token: string;
    setLoading: Dispatch<SetStateAction<boolean>>;
}

const ResetPasswordForm = ({ token, setLoading }: IResetPasswordProps) => {
    const { classes: styles } = useStyles();
    const { classes: themeStyles } = useThemeStyles();
    const [apiError, setApiError] = useState(false);
    const [password, setPassword] = useState('');
    const [showPasswordChecker, setShowPasswordChecker] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [matchingPasswords, setMatchingPasswords] = useState(false);
    const [validOwaspPassword, setValidOwaspPassword] = useState(false);
    const navigate = useNavigate();

    const submittable = matchingPasswords && validOwaspPassword;

    const setValidOwaspPasswordMemo = useCallback(setValidOwaspPassword, [
        setValidOwaspPassword,
    ]);

    useEffect(() => {
        if (!password) {
            setValidOwaspPassword(false);
        }

        if (password === confirmPassword) {
            setMatchingPasswords(true);
        } else {
            setMatchingPasswords(false);
        }
    }, [password, confirmPassword]);

    const makeResetPasswordReq = () => {
        const path = formatApiPath('auth/reset/password');
        return fetch(path, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({
                token,
                password,
            }),
        });
    };

    const submitResetPassword = async () => {
        setLoading(true);

        try {
            const res = await makeResetPasswordReq();
            setLoading(false);
            if (res.status === OK) {
                navigate('login?reset=true');
                setApiError(false);
            } else {
                setApiError(true);
            }
        } catch (e) {
            setApiError(true);
            setLoading(false);
        }
    };

    const handleSubmit = (e: SyntheticEvent) => {
        e.preventDefault();

        if (submittable) {
            submitResetPassword();
        }
    };

    const started = Boolean(password && confirmPassword);

    return (
        <>
            <ConditionallyRender
                condition={apiError}
                show={<ResetPasswordError />}
            />
            <form
                onSubmit={handleSubmit}
                className={classnames(
                    themeStyles.contentSpacingY,
                    styles.container
                )}
            >
                <PasswordField
                    placeholder="Password"
                    value={password || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPassword(e.target.value)
                    }
                    onFocus={() => setShowPasswordChecker(true)}
                    autoComplete="password"
                    data-loading
                />
                <PasswordField
                    value={confirmPassword || ''}
                    placeholder="Confirm password"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setConfirmPassword(e.target.value)
                    }
                    autoComplete="confirm-password"
                    data-loading
                />
                <ConditionallyRender
                    condition={showPasswordChecker}
                    show={
                        <PasswordChecker
                            password={password}
                            callback={setValidOwaspPasswordMemo}
                            style={{ marginBottom: '1rem' }}
                        />
                    }
                />

                <PasswordMatcher
                    started={started}
                    matchingPasswords={matchingPasswords}
                />
                <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    className={styles.button}
                    data-loading
                    disabled={!submittable}
                >
                    Submit
                </Button>
            </form>
        </>
    );
};

export default ResetPasswordForm;
