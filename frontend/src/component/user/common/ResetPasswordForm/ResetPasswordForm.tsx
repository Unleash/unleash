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
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import PasswordChecker from './PasswordChecker/PasswordChecker';
import PasswordMatcher from './PasswordMatcher/PasswordMatcher';
import { useStyles } from './ResetPasswordForm.styles';
import PasswordField from 'component/common/PasswordField/PasswordField';

interface IResetPasswordProps {
    onSubmit: (password: string) => void;
}

const ResetPasswordForm = ({ onSubmit }: IResetPasswordProps) => {
    const { classes: styles } = useStyles();
    const { classes: themeStyles } = useThemeStyles();
    const [password, setPassword] = useState('');
    const [showPasswordChecker, setShowPasswordChecker] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [matchingPasswords, setMatchingPasswords] = useState(false);
    const [validOwaspPassword, setValidOwaspPassword] = useState(false);

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

    const handleSubmit = (e: SyntheticEvent) => {
        e.preventDefault();

        if (submittable) {
            onSubmit(password);
        }
    };

    const started = Boolean(password && confirmPassword);

    return (
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
                autoComplete="new-password"
                data-loading
            />
            <PasswordField
                value={confirmPassword || ''}
                placeholder="Confirm password"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setConfirmPassword(e.target.value)
                }
                autoComplete="new-password"
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
    );
};

export default ResetPasswordForm;
