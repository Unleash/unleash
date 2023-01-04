import { Button, styled } from '@mui/material';
import React, { SyntheticEvent, useCallback, useEffect, useState } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import PasswordChecker from './PasswordChecker';
import PasswordMatcher from './PasswordMatcher';
import PasswordField from 'component/common/PasswordField/PasswordField';

interface IResetPasswordProps {
    onSubmit: (password: string) => void;
}

const StyledForm = styled('form')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    '& > *': {
        marginTop: `${theme.spacing(1)} !important`,
        marginBottom: `${theme.spacing(1)} !important`,
    },
}));

const StyledButton = styled(Button)(({ theme }) => ({
    width: '150px',
    margin: theme.spacing(2, 'auto'),
    display: 'block',
}));

const ResetPasswordForm = ({ onSubmit }: IResetPasswordProps) => {
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
        <StyledForm onSubmit={handleSubmit}>
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
            <StyledButton
                variant="contained"
                color="primary"
                type="submit"
                data-loading
                disabled={!submittable}
            >
                Submit
            </StyledButton>
        </StyledForm>
    );
};

export default ResetPasswordForm;
